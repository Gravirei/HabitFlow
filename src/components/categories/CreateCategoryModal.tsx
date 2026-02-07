import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

import { AccessibleModal } from '@/components/timer/shared/AccessibleModal'
import { Input } from '@/components/Input'
import { useCategoryStore } from '@/store/useCategoryStore'

import { IconPicker } from './IconPicker'
import { ColorPicker, type CategoryColorToken } from './ColorPicker'
import { GradientPicker } from './GradientPicker'
import { ImagePicker } from './ImagePicker'

export interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (categoryId: string) => void
}

const NAME_MAX_LEN = 40

export function CreateCategoryModal({ isOpen, onClose, onCreated }: CreateCategoryModalProps) {
  const { categories, addCategory } = useCategoryStore()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('category')
  const [color, setColor] = useState<CategoryColorToken>('slate')
  const [gradient, setGradient] = useState<string | undefined>(undefined)
  const [imagePath, setImagePath] = useState<string | undefined>(undefined)

  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!isOpen) return
    setName('')
    setIcon('category')
    setColor('slate')
    setGradient(undefined)
    setImagePath(undefined)
    setError(undefined)
  }, [isOpen])

  const normalizedName = name.trim()

  const duplicateName = useMemo(() => {
    const key = normalizedName.toLocaleLowerCase()
    if (!key) return false
    return categories.some((c) => c.name.trim().toLocaleLowerCase() === key)
  }, [categories, normalizedName])

  const isValid = normalizedName.length > 0 && normalizedName.length <= NAME_MAX_LEN && !duplicateName

  const previewTextColor = 'text-white'
  const previewGradient = gradient ?? 'from-gray-900 to-black'

  const handleSubmit = () => {
    setError(undefined)

    if (!isValid) {
      if (!normalizedName) setError('Name is required.')
      else if (normalizedName.length > NAME_MAX_LEN)
        setError(`Name must be ${NAME_MAX_LEN} characters or less.`)
      else if (duplicateName) setError('A category with that name already exists.')
      return
    }

    try {
      const created = addCategory({
        name: normalizedName,
        icon,
        color,
        gradient,
        imagePath,
        isPinned: false,
        textColor: previewTextColor,
        updatedAt: new Date().toISOString(),
      })

      onCreated?.(created.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create category.')
    }
  }

  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} title="Create Category" size="lg">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Create category</h3>
              <p className="mt-1 text-sm text-gray-400">Name it and choose a look.</p>
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
          {/* Form */}
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Health"
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

          {/* Preview */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-200">Preview</p>
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
                <h4 className={clsx('text-xl font-bold', previewTextColor)}>
                  {normalizedName || 'New Category'}
                </h4>
                <p className="mt-1 text-xs text-white/70">0 Habits</p>
              </div>
              {imagePath && (
                <img
                  src={imagePath}
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
                onClick={handleSubmit}
                disabled={!isValid}
                className={clsx(
                  'rounded-xl px-5 py-2 text-sm font-bold transition-all duration-200 active:scale-95',
                  isValid
                    ? 'bg-gradient-to-r from-primary to-emerald-400 text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.25)] cursor-pointer'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                )}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
