import clsx from 'clsx'

export interface GradientPickerProps {
  value?: string
  onChange: (gradient?: string) => void
  label?: string
  className?: string
}

// Keep in sync with common defaults and page fallback gradients.
const GRADIENTS: readonly { name: string; value: string }[] = [
  {
    name: 'Primary Dark',
    value: 'from-gray-900 to-black dark:from-surface-card dark:to-surface-dark',
  },
  {
    name: 'Soft Light',
    value: 'from-gray-100 to-white dark:from-surface-card dark:to-surface-dark',
  },
  {
    name: 'Emerald',
    value: 'from-emerald-400/30 to-emerald-600/10 dark:from-emerald-500/20 dark:to-black/20',
  },
  {
    name: 'Purple',
    value: 'from-purple-400/30 to-purple-600/10 dark:from-purple-500/20 dark:to-black/20',
  },
  {
    name: 'Yellow',
    value: 'from-yellow-300/30 to-yellow-600/10 dark:from-yellow-500/20 dark:to-black/20',
  },
  {
    name: 'Orange',
    value: 'from-orange-300/30 to-orange-600/10 dark:from-orange-500/20 dark:to-black/20',
  },
  {
    name: 'Indigo',
    value: 'from-indigo-400/30 to-indigo-600/10 dark:from-indigo-500/20 dark:to-black/20',
  },
  {
    name: 'Pink',
    value: 'from-pink-400/30 to-pink-600/10 dark:from-pink-500/20 dark:to-black/20',
  },
  {
    name: 'Red',
    value: 'from-red-400/30 to-red-600/10 dark:from-red-500/20 dark:to-black/20',
  },
  {
    name: 'Teal',
    value: 'from-teal-400/30 to-teal-600/10 dark:from-teal-500/20 dark:to-black/20',
  },
  { name: 'Sky', value: 'from-sky-400 to-blue-600' },
]

export function GradientPicker({
  value,
  onChange,
  label = 'Gradient (optional)',
  className,
}: GradientPickerProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="rounded text-xs font-semibold text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:text-gray-400 dark:hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {GRADIENTS.map((g) => {
          const isSelected = g.value === value
          return (
            <button
              key={g.name}
              type="button"
              onClick={() => onChange(g.value)}
              className={clsx(
                'group flex items-center gap-3 rounded-xl border p-2 text-left transition-colors duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
              )}
            >
              <span className={clsx('h-8 w-8 rounded-lg bg-gradient-to-br', g.value)} aria-hidden="true" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{g.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
