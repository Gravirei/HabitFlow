import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import type { Habit } from '@/types/habit'
import { ToggleSwitch } from '@/components/timer/settings/ToggleSwitch'

interface SelectPinHabitsModalProps {
  isOpen: boolean
  onClose: () => void
  habits: Habit[]
}

export function SelectPinHabitsModal({ isOpen, onClose, habits }: SelectPinHabitsModalProps) {
  const { pinHabit, unpinHabit } = useHabitStore()
  const { categories } = useCategoryStore()
  
  // Track pending pin changes (habit id -> pinned status)
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({})

  // Initialize pending changes when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, boolean> = {}
      habits.forEach((habit) => {
        initial[habit.id] = habit.pinned || false
      })
      setPendingChanges(initial)
    }
  }, [isOpen, habits])

  const handleToggle = (habitId: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }))
  }

  const handleApply = () => {
    // Apply all changes
    Object.entries(pendingChanges).forEach(([habitId, shouldPin]) => {
      const habit = habits.find((h) => h.id === habitId)
      if (habit) {
        if (shouldPin && !habit.pinned) {
          pinHabit(habitId)
        } else if (!shouldPin && habit.pinned) {
          unpinHabit(habitId)
        }
      }
    })
    onClose()
  }

  const handleCancel = () => {
    // Reset pending changes
    const initial: Record<string, boolean> = {}
    habits.forEach((habit) => {
      initial[habit.id] = habit.pinned || false
    })
    setPendingChanges(initial)
    onClose()
  }

  // Get category name
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Other'
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'Other'
  }

  // Count how many habits are pinned
  const pinnedCount = Object.values(pendingChanges).filter(Boolean).length

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Habits to Pin
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {pinnedCount} {pinnedCount === 1 ? 'habit' : 'habits'} will be pinned
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Habits List */}
            <div className="max-h-[calc(80vh-180px)] overflow-y-auto p-6">
              {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined mb-3 text-5xl text-gray-300 dark:text-gray-600">
                    inbox
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No habits found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        {/* Habit Icon */}
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${
                              habit.iconColor !== undefined && habit.iconColor >= 0
                                ? `var(--icon-gradient-${habit.iconColor}-from), var(--icon-gradient-${habit.iconColor}-to)`
                                : 'var(--icon-gradient-0-from), var(--icon-gradient-0-to)'
                            })`,
                          }}
                        >
                          <span className="material-symbols-outlined text-xl text-white">
                            {habit.icon || 'star'}
                          </span>
                        </div>

                        {/* Habit Info */}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {habit.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getCategoryName(habit.categoryId)} • {habit.frequency}
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <ToggleSwitch
                        enabled={pendingChanges[habit.id] || false}
                        onChange={() => handleToggle(habit.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                onClick={handleCancel}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 dark:from-orange-600 dark:to-orange-700"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
