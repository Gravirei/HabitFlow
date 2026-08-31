import { useNavigate, useSearchParams } from 'react-router-dom'
import { NewHabitWizard } from '@/features/habits/components/NewHabitWizard'

/**
 * Route shell for /new-habit — kept for deep links (e.g. /new-habit?categoryId=fitness).
 * The primary entry points (Today FAB, bottom-nav +, ProgressOverview) open the
 * in-place modal instead of navigating here.
 */
export function NewHabit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Phase 2 Categories: allow preselecting category via query param.
  // Example: /new-habit?categoryId=fitness
  // Keep backward compatibility: when absent (or empty), store nothing.
  const categoryIdFromQuery = searchParams.get('categoryId')?.trim() || undefined
  const frequencyFromQuery =
    (searchParams.get('frequency') as 'daily' | 'weekly' | 'monthly') || undefined

  return (
    <div className="flex min-h-dvh w-full justify-center bg-background-light dark:bg-background-dark md:items-center md:p-6 lg:p-10">
      <NewHabitWizard
        variant="page"
        categoryId={categoryIdFromQuery}
        defaultFrequency={frequencyFromQuery}
        onClose={() => navigate('/today')}
      />
    </div>
  )
}
