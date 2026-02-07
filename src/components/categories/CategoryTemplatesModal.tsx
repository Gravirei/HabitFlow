import { useMemo, useState } from 'react'
import clsx from 'clsx'

import { AccessibleModal } from '@/components/timer/shared/AccessibleModal'
import {
  CATEGORY_TEMPLATE_PACKS,
  type CategoryTemplatePack,
} from '@/constants/categoryTemplatePacks'
import { applyTemplatePack, type TemplatePackImportSummary } from '@/lib/categories/templates'

export type CategoryTemplatesModalProps = {
  isOpen: boolean
  onClose: () => void
}

const formatSummaryLine = (summary: TemplatePackImportSummary) => {
  const categoryPart = `${summary.categories.added} categories added, ${summary.categories.skipped} skipped`
  const habitPart = `${summary.habits.added} habits added, ${summary.habits.skipped} skipped${
    summary.habits.renamed > 0 ? ` (${summary.habits.renamed} renamed)` : ''
  }`

  return `${categoryPart} • ${habitPart}`
}

export function CategoryTemplatesModal({ isOpen, onClose }: CategoryTemplatesModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<CategoryTemplatePack['id'] | null>(null)
  const [summary, setSummary] = useState<TemplatePackImportSummary | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const selectedPack = useMemo(() => {
    if (!selectedPackId) return null
    return CATEGORY_TEMPLATE_PACKS.find((pack) => pack.id === selectedPackId) ?? null
  }, [selectedPackId])

  const handleImport = async (packId: CategoryTemplatePack['id']) => {
    // Keep this synchronous (store updates) but allow UI to show disabled state.
    setIsImporting(true)
    setSelectedPackId(packId)

    try {
      const result = applyTemplatePack(packId)
      setSummary(result)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} title="Category templates" size="lg">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Templates</h3>
              <p className="mt-1 text-sm text-gray-400">
                Import a starter pack of categories and sample habits.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/5 text-gray-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5">
          <div className="space-y-3">
            {CATEGORY_TEMPLATE_PACKS.map((pack) => {
              const isSelected = selectedPackId === pack.id
              const canImport = !isImporting

              return (
                <div
                  key={pack.id}
                  className={clsx(
                    'rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm',
                    isSelected && 'ring-1 ring-primary/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-bold text-white">{pack.title}</h4>
                      <p className="mt-1 text-sm text-gray-400">{pack.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pack.categories.map((category) => (
                          <span
                            key={`${pack.id}-${category.name}`}
                            className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold text-gray-200"
                          >
                            <span
                              className="material-symbols-outlined text-[14px]"
                              aria-hidden="true"
                            >
                              {category.icon}
                            </span>
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleImport(pack.id)}
                      disabled={!canImport}
                      className={clsx(
                        'shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95',
                        canImport
                          ? 'bg-primary text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.25)] hover:bg-primary/90'
                          : 'cursor-not-allowed bg-white/10 text-gray-500'
                      )}
                      aria-label={`Import ${pack.title} template pack`}
                    >
                      {isImporting && isSelected ? 'Importing…' : 'Import'}
                    </button>
                  </div>

                  {summary && summary.packId === pack.id ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            check_circle
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">Imported</p>
                          <p className="mt-1 text-sm text-gray-300">{formatSummaryLine(summary)}</p>

                          {summary.errors.length > 0 ? (
                            <details className="mt-2 text-sm text-amber-200">
                              <summary className="cursor-pointer select-none font-semibold">
                                {summary.errors.length} warning
                                {summary.errors.length === 1 ? '' : 's'}
                              </summary>
                              <ul className="mt-2 list-disc space-y-1 pl-5">
                                {summary.errors.map((err, idx) => (
                                  <li key={`${pack.id}-err-${idx}`}>{err}</li>
                                ))}
                              </ul>
                            </details>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
