import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { useCategoryStore } from '@/store/useCategoryStore'
import { IconPicker } from './IconPicker'
import { ColorPicker, type CategoryColorToken } from './ColorPicker'
import { GradientPicker } from './GradientPicker'
import { ImagePicker } from './ImagePicker'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (categoryId: string) => void
}

const NAME_MAX_LEN = 40

// Map color tokens to text color classes
const getIconColorClass = (color: CategoryColorToken): string => {
  const colorMap: Record<CategoryColorToken, string> = {
    primary: 'text-primary',
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-400',
    orange: 'text-orange-500',
    indigo: 'text-indigo-500',
    pink: 'text-pink-500',
    red: 'text-red-500',
    teal: 'text-teal-500',
    sky: 'text-sky-500',
    slate: 'text-slate-400',
  }
  return colorMap[color] || 'text-slate-700'
}

export function CreateCategoryModal({ isOpen, onClose, onCreated }: CreateCategoryModalProps) {
  const { categories, addCategory } = useCategoryStore()

  // Form state
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('category')
  const [color, setColor] = useState<CategoryColorToken>('primary')
  const [gradient, setGradient] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [height, setHeight] = useState('h-40')

  // UI state
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setIcon('category')
      setColor('primary')
      setGradient('')
      setImagePath('')
      setHeight('h-40')
      setError('')
      setIsSubmitting(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    const trimmed = name.trim()

    if (!trimmed) {
      setError('Category name is required')
      return
    }

    if (trimmed.length > NAME_MAX_LEN) {
      setError(`Name must be ${NAME_MAX_LEN} characters or less`)
      return
    }

    // Check for duplicate
    const duplicate = categories.find(
      (c) => c.name.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      setError('A category with this name already exists')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Simulate async operation for smooth animation
      await new Promise((resolve) => setTimeout(resolve, 400))

      const created = addCategory({
        name: trimmed,
        icon,
        color,
        gradient,
        imagePath,
        height,
      })

      onCreated?.(created.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && name.trim()) {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 flex h-[90vh] w-[95vw] max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl dark:border-white/5 dark:bg-gray-950/90 md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Panel - Preview */}
          <div className="hidden w-64 flex-shrink-0 border-r border-gray-200/50 bg-gray-50/80 p-6 backdrop-blur-xl dark:border-white/5 dark:bg-white/5 md:block">
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-symbols-outlined text-3xl text-white">add_circle</span>
              </motion.div>
              <div>
                <h3 className="text-base font-bold text-white">Create</h3>
                <p className="text-sm text-gray-400">New Category</p>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gray-500">visibility</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Preview</p>
              </div>
              
              <motion.div
                layout
                className={clsx(
                  'relative flex w-full flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-4',
                  height,
                  // Apply gradient or image as background
                  imagePath ? '' : gradient ? `bg-gradient-to-br ${gradient}` : 'bg-slate-800/50'
                )}
                style={{
                  backgroundImage: imagePath ? `url(${imagePath})` : undefined,
                  backgroundSize: imagePath ? 'cover' : undefined,
                  backgroundPosition: imagePath ? 'center' : undefined,
                }}
              >
                <div className="absolute left-4 top-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur-sm">
                    <span className={clsx("material-symbols-outlined text-xl", getIconColorClass(color))}>
                      {icon}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-base font-bold text-white drop-shadow-sm">
                    {name || 'Category Name'}
                  </h3>
                  <p className="text-xs text-white/70">0 Habits</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Details</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setError('')
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Health & Fitness"
                      maxLength={NAME_MAX_LEN}
                      className={clsx(
                        'w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2',
                        error
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-white/10 focus:border-primary focus:ring-primary/20'
                      )}
                    />
                    <span className="absolute bottom-3 right-4 text-xs text-gray-500">
                      {name.length}/{NAME_MAX_LEN}
                    </span>
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Icon and Color Row */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Icon */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Icon
                    </label>
                    <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
                        <span className="text-sm text-gray-300">{icon}</span>
                      </div>
                      <IconPicker value={icon} onChange={setIcon} />
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Color
                    </label>
                    <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-gray-300 capitalize">{color}</span>
                      </div>
                      <ColorPicker value={color} onChange={setColor} />
                    </div>
                  </div>
                </div>

                {/* Gradient (Optional) */}
                <div>
                  <GradientPicker 
                    value={gradient} 
                    onChange={setGradient}
                    label="Gradient (optional)"
                  />
                </div>

                {/* Image (Optional) */}
                <div>
                  <ImagePicker 
                    value={imagePath} 
                    onChange={setImagePath}
                    label="Image (optional)"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Card Height
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['h-36', 'h-40', 'h-48', 'h-56'].map((h) => (
                      <motion.button
                        key={h}
                        type="button"
                        onClick={() => setHeight(h)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={clsx(
                          'rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-200',
                          height === h
                            ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/10'
                            : 'border-white/10 bg-slate-800/50 text-gray-400 hover:border-white/20 hover:bg-slate-800'
                        )}
                      >
                        {h.replace('h-', '')}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-white/10 bg-transparent px-6 py-2.5 text-sm font-semibold text-gray-300 transition-all duration-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                whileHover={{ scale: name.trim() && !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: name.trim() && !isSubmitting ? 0.98 : 1 }}
                className={clsx(
                  'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
                  isSubmitting
                    ? 'bg-primary/70'
                    : 'bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30'
                )}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="material-symbols-outlined text-lg"
                    >
                      progress_activity
                    </motion.span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Create Category
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
