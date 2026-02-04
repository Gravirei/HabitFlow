import type { Task } from '@/types/task'
import { AccessibleModal } from './timer/shared/AccessibleModal'
import { cn } from '@/utils/cn'

interface SubtaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
  onToggleSubtask: (taskId: string, subtaskId: string) => void
}

export function SubtaskModal({ isOpen, onClose, task, onToggleSubtask }: SubtaskModalProps) {
  const completedCount = task.subtasks.filter((st) => st.completed).length
  const totalCount = task.subtasks.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Subtasks - ${task.title}`}
      maxWidth="max-w-lg"
      closeOnBackdropClick={true}
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900">
        {/* Header */}
        <div className="relative border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white px-6 py-5 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-purple shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white">checklist</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subtasks</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl text-gray-600 dark:text-gray-400">
                close
              </span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-accent-purple to-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Subtasks List */}
        <div className="max-h-[50vh] overflow-y-auto p-6">
          {task.subtasks.length > 0 ? (
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                    subtask.completed
                      ? 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20'
                      : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-900/50'
                  )}
                  onClick={() => onToggleSubtask(task.id, subtask.id)}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all',
                      subtask.completed
                        ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {subtask.completed && (
                      <span className="material-symbols-outlined text-sm font-bold text-white">
                        check
                      </span>
                    )}
                  </div>

                  {/* Subtask Text */}
                  <span
                    className={cn(
                      'flex-1 text-sm font-medium',
                      subtask.completed
                        ? 'text-gray-400 line-through dark:text-gray-500'
                        : 'text-gray-900 dark:text-white'
                    )}
                  >
                    {subtask.text}
                  </span>

                  {/* Done Badge */}
                  {subtask.completed && (
                    <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                      Done
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <span className="material-symbols-outlined text-4xl text-gray-400">add_task</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No subtasks yet
              </h3>
              <p className="mt-1 max-w-xs text-center text-sm text-gray-500 dark:text-gray-400">
                Break down this task into smaller steps to track your progress
              </p>
            </div>
          )}
        </div>
      </div>
    </AccessibleModal>
  )
}
