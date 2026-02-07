import clsx from 'clsx'

export interface ImagePickerProps {
  value?: string
  onChange: (imagePath?: string) => void
  label?: string
  className?: string
}

// Predefined choices only; no upload yet.
const CATEGORY_IMAGES: readonly { name: string; path: string }[] = [
  { name: 'Fitness', path: '/images/fitness_category_1765389556173.png' },
  { name: 'Health', path: '/images/health_category_1765389659577.png' },
  { name: 'Home', path: '/images/home_category_1765389641054.png' },
  { name: 'Learning', path: '/images/learning_category_1765389616917.png' },
  { name: 'Mindfulness', path: '/images/mindfulness_category_1765389597087.png' },
  { name: 'Work', path: '/images/work_category_1765389575321.png' },
]

export function ImagePicker({ value, onChange, label = 'Image (optional)', className }: ImagePickerProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-200">{label}</label>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="rounded text-xs font-semibold text-gray-400 underline-offset-2 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CATEGORY_IMAGES.map((img) => {
          const isSelected = img.path === value
          return (
            <button
              key={img.path}
              type="button"
              onClick={() => onChange(img.path)}
              className={clsx(
                'relative overflow-hidden rounded-xl border transition-colors duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected ? 'border-primary/50' : 'border-white/10 hover:border-white/20'
              )}
              aria-pressed={isSelected}
              title={img.name}
            >
              <img src={img.path} alt={img.name} className="h-20 w-full object-cover" />
              {isSelected && (
                <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/80 text-background-dark">
                  <span className="material-symbols-outlined text-base">check</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-xs text-gray-500">Uses predefined assets only. Uploads come later.</p>
    </div>
  )
}
