import { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

import { useCategoryStore } from '@/store/useCategoryStore'

import { IconPicker } from './IconPicker'
import { ColorPicker, type CategoryColorToken } from './ColorPicker'
import { GradientPicker } from './GradientPicker'
import { ImagePicker } from './ImagePicker'

export interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
}

const NAME_MAX_LEN = 40

export function EditCategoryModal({ isOpen, onClose, categoryId }: EditCategoryModalProps) {
  const { categories, getCategoryById, updateCategory } = useCategoryStore()

  const category = getCategoryById(categoryId)

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('category')
  const [color, setColor] = useState<CategoryColorToken>('slate')
  const [gradient, setGradient] = useState<string | undefined>(undefined)
  const [imagePath, setImagePath] = useState<string | undefined>(undefined)
  const [height, setHeight] = useState('h-40')

  const [error, setError] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    if (!category) return

    setName(category.name)
    setIcon(category.icon)
    setColor(category.color as CategoryColorToken)
    setGradient(category.gradient)
    setImagePath(category.imagePath)
    setHeight(category.height || 'h-40')
    setError(undefined)
    setIsSubmitting(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen, category])

  const normalizedName = name.trim()

  const duplicateName = useMemo(() => {
    const key = normalizedName.toLocaleLowerCase()
    if (!key) return false

    return categories.some((c) => c.id !== categoryId && c.name.trim().toLocaleLowerCase() === key)
  }, [categories, normalizedName, categoryId])

  const isValid = normalizedName.length > 0 && normalizedName.length <= NAME_MAX_LEN && !duplicateName

  const handleSave = async () => {
    setError(undefined)

    if (!isValid) {
      if (!normalizedName) setError('Category name is required')
      else if (normalizedName.length > NAME_MAX_LEN)
        setError(`Name must be ${NAME_MAX_LEN} characters or less`)
      else if (duplicateName) setError('A category with this name already exists')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate async operation for smooth animation
      await new Promise((resolve) => setTimeout(resolve, 400))

      updateCategory(categoryId, {
        name: normalizedName,
        icon,
        color,
        gradient,
        imagePath,
        height,
        updatedAt: new Date().toISOString(),
      })

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && name.trim()) {
      handleSave()
    }
  }

  if (!isOpen) return null

  if (!category) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">Category not found</h3>
            <p className="mt-2 text-sm text-gray-400">This category may have been deleted.</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

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
                <span className="material-symbols-outlined text-3xl text-white">edit</span>
              </motion.div>
              <div>
                <h3 className="text-base font-bold text-white">Edit</h3>
                <p className="text-sm text-gray-400">Category</p>
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
                {imagePath && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                )}
                
                <div className="absolute left-4 top-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur-sm">
                    <span className="material-symbols-outlined text-xl text-slate-700">
                      {icon}
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-base font-bold text-white drop-shadow-sm">
                    {name || category.name}
                  </h3>
                  <p className="text-xs text-white/70">{category.stats?.habitCount || 0} Habits</p>
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
                disabled={isSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
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
                        setError(undefined)
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Health & Fitness"
                      maxLength={NAME_MAX_LEN}
                      disabled={isSubmitting}
                      className={clsx(
                        'w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50',
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
                      <ColorPicker value={color} onChange={setColor} />
                    </div>
                  </div>
                </div>

                {/* Gradient */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Gradient
                  </label>
                  <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3">
                    <GradientPicker value={gradient} onChange={setGradient} />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Background Image
                  </label>
                  <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3">
                    <ImagePicker value={imagePath} onChange={setImagePath} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid || isSubmitting}
                className={clsx(
                  'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200',
                  isValid && !isSubmitting
                    ? 'bg-gradient-to-r from-primary to-emerald-400 text-slate-900 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-95'
                    : 'cursor-not-allowed bg-white/10 text-gray-500'
                )}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
