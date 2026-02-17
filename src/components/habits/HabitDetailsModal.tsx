import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '@/store/useHabitStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { iconColorOptions } from '@/components/categories/CreateNewHabit'
import { format } from 'date-fns'

interface HabitDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
}

export function HabitDetailsModal({ isOpen, onClose, habitId }: HabitDetailsModalProps) {
  const { habits } = useHabitStore()
  const { categories } = useCategoryStore()
  const { habitTasks } = useHabitTaskStore()

  const habit = habits.find((h) => h.id === habitId)
  const category = categories.find((c) => c.id === habit?.categoryId)
  const tasks = habitTasks?.filter((t) => t.habitId === habitId) || []

  if (!habit) return null

  const iconColor = iconColorOptions[habit.iconColor ?? 0]
  const createdDate = habit.createdAt ? new Date(habit.createdAt) : null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: iconColor.bg }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: iconColor.text }}>
                    {habit.icon}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {habit.name}
                  </h2>
                  {category && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {category.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Basic Information
                  </h3>
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
                    <InfoRow
                      icon="calendar_today"
                      label="Frequency"
                      value={habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                    />
                    <InfoRow
                      icon="flag"
                      label="Goal"
                      value={`${habit.goal} ${habit.goalPeriod}`}
                    />
                    {habit.description && (
                      <InfoRow
                        icon="description"
                        label="Description"
                        value={habit.description}
                      />
                    )}
                    {createdDate && (
                      <InfoRow
                        icon="event"
                        label="Created"
                        value={format(createdDate, 'MMM dd, yyyy')}
                      />
                    )}
                  </div>
                </section>

                {/* Statistics */}
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      icon="local_fire_department"
                      label="Current Streak"
                      value={habit.currentStreak}
                      iconColor="text-orange-500"
                      bgColor="bg-orange-50 dark:bg-orange-500/10"
                    />
                    <StatCard
                      icon="emoji_events"
                      label="Best Streak"
                      value={habit.bestStreak}
                      iconColor="text-yellow-500"
                      bgColor="bg-yellow-50 dark:bg-yellow-500/10"
                    />
                    <StatCard
                      icon="check_circle"
                      label="Total Completions"
                      value={habit.totalCompletions}
                      iconColor="text-green-500"
                      bgColor="bg-green-50 dark:bg-green-500/10"
                    />
                    <StatCard
                      icon="percent"
                      label="Completion Rate"
                      value={`${habit.completionRate}%`}
                      iconColor="text-blue-500"
                      bgColor="bg-blue-50 dark:bg-blue-500/10"
                    />
                  </div>
                </section>

                {/* Tasks */}
                {tasks.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Tasks ({tasks.length})
                    </h3>
                    <div className="space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <span className="material-symbols-outlined text-lg text-purple-500">
                            {task.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span className={task.isCompleted ? 'line-through opacity-60' : ''}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Notes */}
                {habit.notes && habit.notes.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Notes ({habit.notes.length})
                    </h3>
                    <div className="space-y-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                      {habit.notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-lg bg-white p-3 dark:bg-slate-700"
                        >
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {note.text}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {format(new Date(note.createdAt), 'MMM dd, yyyy • hh:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recent Activity */}
                {habit.completedDates.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Recent Activity
                    </h3>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
                      <div className="flex flex-wrap gap-2">
                        {habit.completedDates
                          .slice(-10)
                          .reverse()
                          .map((date) => (
                            <div
                              key={date}
                              className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            >
                              {format(new Date(date), 'MMM dd')}
                            </div>
                          ))}
                      </div>
                      {habit.completedDates.length > 10 && (
                        <p className="mt-2 text-xs text-slate-500">
                          Showing last 10 completions
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {/* Status Badges */}
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {habit.isActive ? (
                      <StatusBadge icon="check_circle" label="Active" color="green" />
                    ) : (
                      <StatusBadge icon="pause_circle" label="Inactive" color="gray" />
                    )}
                    {habit.archived && (
                      <StatusBadge icon="archive" label="Archived" color="orange" />
                    )}
                    {habit.pinned && (
                      <StatusBadge icon="push_pin" label="Pinned" color="blue" />
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-lg text-slate-400">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  iconColor,
  bgColor,
}: {
  icon: string
  label: string
  value: number | string
  iconColor: string
  bgColor: string
}) {
  return (
    <div className={`rounded-xl p-4 ${bgColor}`}>
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {value}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  }

  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${colorClasses[color as keyof typeof colorClasses]}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      <span>{label}</span>
    </div>
  )
}
