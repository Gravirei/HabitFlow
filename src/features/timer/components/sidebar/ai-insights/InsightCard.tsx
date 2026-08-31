/**
 * Insight Card - Individual insight display
 */

interface InsightCardProps {
  icon: string
  title: string
  value: string
  message: string
  trend?: 'improving' | 'declining' | 'stable'
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'indigo' | 'pink'
}

export function InsightCard({
  icon,
  title,
  value,
  message,
  trend,
  color = 'blue',
}: InsightCardProps) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-cyan-600',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'from-green-500 to-emerald-600',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    orange: {
      bg: 'from-orange-500 to-red-600',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    purple: {
      bg: 'from-purple-500 to-pink-600',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    indigo: {
      bg: 'from-indigo-500 to-blue-600',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    pink: {
      bg: 'from-pink-500 to-rose-600',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-200 dark:border-pink-800',
    },
  }

  const colors = colorClasses[color]

  return (
    <div
      className={`rounded-xl border bg-white p-5 dark:bg-slate-700 ${colors.border} transition-shadow hover:shadow-lg`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-[22px] text-white">{icon}</span>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'improving'
                ? 'text-green-600 dark:text-green-400'
                : trend === 'declining'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {trend === 'improving'
                ? 'trending_up'
                : trend === 'declining'
                  ? 'trending_down'
                  : 'trending_flat'}
            </span>
            {trend === 'improving' ? 'Up' : trend === 'declining' ? 'Down' : 'Stable'}
          </div>
        )}
      </div>

      <h4 className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h4>

      <p className={`text-2xl font-bold ${colors.text} mb-2`}>{value}</p>

      <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  )
}
