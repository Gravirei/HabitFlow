import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

import { AccessibleModal } from '@/components/timer/shared/AccessibleModal'
import { Input } from '@/components/Input'
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
  const { categories, getCategoryById, updateCategory, togglePinned } = useCategoryStore()

  const category = getCategoryById(categoryId)

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('category')
  const [color, setColor] = useState<CategoryColorToken>('slate')
  const [gradient, setGradient] = useState<string | undefined>(undefined)
  const [imagePath, setImagePath] = useState<string | undefined>(undefined)

  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!isOpen) return
    if (!category) return

    setName(category.name)
    setIcon(category.icon)
    setColor(category.color as CategoryColorToken)
    setGradient(category.gradient)
    setImagePath(category.imagePath)
    setError(undefined)
  }, [isOpen, category])

  const normalizedName = name.trim()

  const duplicateName = useMemo(() => {
    const key = normalizedName.toLocaleLowerCase()
    if (!key) return false

    return categories.some((c) => c.id !== categoryId && c.name.trim().toLocaleLowerCase() === key)
  }, [categories, normalizedName, categoryId])

  const isValid = normalizedName.length > 0 && normalizedName.length <= NAME_MAX_LEN && !duplicateName

  const handleSave = () => {
    setError(undefined)

    if (!isValid) {
      if (!normalizedName) setError('Name is required.')
      else if (normalizedName.length > NAME_MAX_LEN)
        setError(`Name must be ${NAME_MAX_LEN} characters or less.`)
      else if (duplicateName) setError('A category with that name already exists.')
      return
    }

    updateCategory(categoryId, {
      name: normalizedName,
      icon,
      color,
      gradient,
      imagePath,
      updatedAt: new Date().toISOString(),
    })

    onClose()
  }

  if (!isOpen) return null

  if (!category) {
    return (
      <AccessibleModal isOpen={isOpen} onClose={onClose} title="Edit Category" size="md">
        <div className="p-6">
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
        </div>
      </AccessibleModal>
    )
  }

  const previewGradient = gradient ?? category.gradient ?? 'from-gray-900 to-black'

  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} title="Edit Category" size="lg">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Edit category</h3>
              <p className="mt-1 text-sm text-gray-400">Update details and appearance.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-200 hover:bg-white/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX_LEN}
              error={error}
            />

            {duplicateName && !error && (
              <p className="text-sm text-amber-300">A category with that name already exists.</p>
            )}

            <IconPicker value={icon} onChange={setIcon} />
            <ColorPicker value={color} onChange={setColor} />
            <GradientPicker value={gradient} onChange={setGradient} />
            <ImagePicker value={imagePath} onChange={setImagePath} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-200">Preview</p>
              <button
                type="button"
                onClick={() => togglePinned(categoryId)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span className="material-symbols-outlined text-base">
                  {category.isPinned ? 'star' : 'star_outline'}
                </span>
                {category.isPinned ? 'Unpin' : 'Pin'}
              </button>
            </div>

            <div
              className={clsx(
                'relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-5',
                previewGradient
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-2xl text-white">{icon}</span>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-xl font-bold text-white">{normalizedName || category.name}</h4>
                <p className="mt-1 text-xs text-white/70">{category.stats.habitCount} Habits</p>
              </div>
              {(imagePath || category.imagePath) && (
                <img
                  src={imagePath ?? category.imagePath}
                  alt="Selected category"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid}
                className={clsx(
                  'rounded-xl px-5 py-2 text-sm font-bold transition-all duration-200 active:scale-95',
                  isValid
                    ? 'bg-gradient-to-r from-primary to-emerald-400 text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.25)] cursor-pointer'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                )}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
