import { useRef } from 'react'
import clsx from 'clsx'

export interface ImagePickerProps {
  value?: string
  onChange: (imagePath?: string) => void
  label?: string
  className?: string
}

const CATEGORY_IMAGES: readonly { name: string; path: string }[] = [
  { name: 'Fitness', path: '/images/fitness_category_1765389556173.png' },
  { name: 'Health', path: '/images/health_category_1765389659577.png' },
  { name: 'Home', path: '/images/home_category_1765389641054.png' },
  { name: 'Learning', path: '/images/learning_category_1765389616917.png' },
  { name: 'Mindfulness', path: '/images/mindfulness_category_1765389597087.png' },
  { name: 'Work', path: '/images/work_category_1765389575321.png' },
]

export function ImagePicker({ value, onChange, label = 'Image (optional)', className }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const isCustomUpload = value && (value.startsWith('data:') || value.startsWith('blob:'))

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload image file"
      />

      <div className="grid grid-cols-3 gap-2">
        {/* Upload Button or Uploaded Image - First Grid Item */}
        {isCustomUpload ? (
          <button
            type="button"
            onClick={() => onChange(value)}
            className={clsx(
              'relative aspect-video overflow-hidden rounded-xl border transition-colors duration-200 cursor-pointer',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'border-primary ring-2 ring-primary/20'
            )}
          >
            <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
            {/* Selected indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg">
                <span className="material-symbols-outlined text-lg text-white">check</span>
              </div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-white/20 dark:bg-white/5 dark:text-gray-400 dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <span className="material-symbols-outlined text-2xl">upload</span>
            <span className="text-[10px] font-semibold">Upload</span>
          </button>
        )}

        {/* Preset Images */}
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
                isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20'
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

      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Select a background image for your category card.</p>
    </div>
  )
}
