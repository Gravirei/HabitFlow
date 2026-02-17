import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '@/store/useHabitStore'
import type { Habit } from '@/types/habit'
import { iconColorOptions } from './CreateNewHabit'
import clsx from 'clsx'

interface ArchivedHabitsModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId?: string
}

export function ArchivedHabitsModal({ isOpen, onClose, categoryId }: ArchivedHabitsModalProps) {
  const { habits, unarchiveHabit, deleteHabit } = useHabitStore()

  // Filter archived habits (optionally by category)
  const archivedHabits = habits.filter((habit) => {
    const isArchived = habit.archived === true
    const matchesCategory = categoryId ? habit.categoryId === categoryId : true
    return isArchived && matchesCategory
  })

  const handleUnarchive = (habitId: string) => {
    unarchiveHabit(habitId)
  }

  const handleDelete = (habitId: string) => {
    if (confirm('Permanently delete this habit? This action cannot be undone.')) {
      deleteHabit(habitId)
    }
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
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-xl text-slate-600 dark:text-slate-400">
                    archive
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Archived Habits</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {archivedHabits.length} {archivedHabits.length === 1 ? 'habit' : 'habits'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {archivedHabits.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3">
                  {archivedHabits.map((habit) => (
                    <ArchivedHabitCard
                      key={habit.id}
                      habit={habit}
                      onUnarchive={() => handleUnarchive(habit.id)}
                      onDelete={() => handleDelete(habit.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <span className="material-symbols-outlined text-5xl text-slate-400">inventory_2</span>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">No archived habits</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Archived habits will appear here. You can archive habits from the habit menu.
      </p>
    </div>
  )
}

// Archived Habit Card Component
interface ArchivedHabitCardProps {
  habit: Habit
  onUnarchive: () => void
  onDelete: () => void
}

function ArchivedHabitCard({ habit, onUnarchive, onDelete }: ArchivedHabitCardProps) {
  const colorScheme = iconColorOptions[habit.iconColor ?? 0]
  const gradientClass = colorScheme?.gradient || 'from-gray-500 to-gray-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      {/* Icon */}
      <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br', gradientClass)}>
        <span className="material-symbols-outlined text-xl text-white">{habit.icon}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{habit.name}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Archived {habit.archivedDate ? new Date(habit.archivedDate).toLocaleDateString() : 'recently'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUnarchive}
          className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
        >
          <span className="material-symbols-outlined text-lg">unarchive</span>
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </motion.div>
  )
}
