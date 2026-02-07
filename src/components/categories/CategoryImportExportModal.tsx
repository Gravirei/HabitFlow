import { useState, useRef } from 'react'
import clsx from 'clsx'

import { AccessibleModal } from '@/components/timer/shared/AccessibleModal'
import {
  buildCategoryExportBundle,
  parseCategoryExportBundle,
  applyCategoryImport,
  type CategoryImportSummary,
} from '@/lib/categories/importExport'

export type CategoryImportExportModalProps = {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'export' | 'import'

export function CategoryImportExportModal({ isOpen, onClose }: CategoryImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('export')
  const [importSummary, setImportSummary] = useState<CategoryImportSummary | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const bundle = buildCategoryExportBundle()
      const jsonString = JSON.stringify(bundle, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `habitflow-categories-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset previous state
    setImportSummary(null)
    setImportError(null)

    try {
      const text = await file.text()
      const bundle = parseCategoryExportBundle(text)
      const summary = applyCategoryImport(bundle)
      setImportSummary(summary)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import file')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} title="Import/Export Categories" size="lg">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Import/Export</h3>
              <p className="mt-1 text-sm text-gray-400">
                Backup or restore your categories as JSON files.
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

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={clsx(
              'relative px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              activeTab === 'export' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
            )}
          >
            Export
            {activeTab === 'export' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('import')
              setImportSummary(null)
              setImportError(null)
            }}
            className={clsx(
              'relative px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              activeTab === 'import' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
            )}
          >
            Import
            {activeTab === 'import' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        <div className="p-5">
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      download
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">Export Categories</h4>
                    <p className="mt-1 text-sm text-gray-400">
                      Download all your categories as a JSON file. This includes category names,
                      colors, icons, and settings.
                    </p>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-bold text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.25)] transition-all duration-200 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95"
                    >
                      Download JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      upload
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">Import Categories</h4>
                    <p className="mt-1 text-sm text-gray-400">
                      Upload a JSON file to restore categories. Categories with duplicate names will
                      be skipped.
                    </p>
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json,application/json"
                          onChange={handleFileSelect}
                          className="sr-only"
                          aria-label="Choose JSON file to import"
                        />
                        <span className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-background-dark shadow-[0_8px_24px_rgba(19,236,91,0.25)] transition-all duration-200 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95">
                          Choose File
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import Summary */}
              {importSummary && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5" role="status">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        check_circle
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">Import Complete</p>
                      <p className="mt-1 text-sm text-gray-300">
                        {importSummary.importedCount} categor
                        {importSummary.importedCount === 1 ? 'y' : 'ies'} imported,{' '}
                        {importSummary.skippedCount} skipped
                      </p>
                      {importSummary.errors.length > 0 && (
                        <details className="mt-2 text-sm text-amber-200">
                          <summary className="cursor-pointer select-none font-semibold">
                            {importSummary.errors.length} warning
                            {importSummary.errors.length === 1 ? '' : 's'}
                          </summary>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {importSummary.errors.map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Error */}
              {importError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5" role="alert">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        error
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-300">Import Failed</p>
                      <p className="mt-1 text-sm text-red-200">{importError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex items-center justify-end">
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
