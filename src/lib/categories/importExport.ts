import type { Category, CategoryId } from '@/types/category'
import type { CategoryExportBundle } from '@/types/categoryExport'
import { CategoryExportBundleV1Schema } from '@/types/categoryExport'
import { useCategoryStore } from '@/store/useCategoryStore'

const MAX_BYTES = 500 * 1024
const MAX_CATEGORIES = 500

export type BuildCategoryExportBundleOptions = {
  // Phase 6 decision B1: categories-only export.
  includeHabits?: false
  includeTasks?: false
}

export const buildCategoryExportBundle = (
  _options: BuildCategoryExportBundleOptions = {}
): CategoryExportBundle => {
  const { categories } = useCategoryStore.getState()

  const bundle: CategoryExportBundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
  }

  // Validate before returning so callers always get a canonical bundle.
  return CategoryExportBundleV1Schema.parse(bundle)
}

const byteLength = (value: string) => {
  // TextEncoder is available in modern browsers and in Vitest's jsdom env.
  return new TextEncoder().encode(value).byteLength
}

export const parseCategoryExportBundle = (rawJson: string): CategoryExportBundle => {
  const trimmed = rawJson.trim()
  if (!trimmed) {
    throw new Error('Import failed: JSON file is empty.')
  }

  if (byteLength(trimmed) > MAX_BYTES) {
    throw new Error('Import failed: file is larger than 500KB.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('Import failed: invalid JSON.')
  }

  const bundle = CategoryExportBundleV1Schema.parse(parsed)

  if (bundle.categories.length > MAX_CATEGORIES) {
    throw new Error('Import failed: bundle contains more than 500 categories.')
  }

  return bundle
}

export type ApplyCategoryImportOptions = {
  /**
   * Decision Gate 2 / I1: conflicts matched by name (case-insensitive) are skipped.
   * (No overwrite / no destructive replace.)
   */
  conflictStrategy?: 'skip-by-name'
}

export type CategoryImportSummary = {
  importedCount: number
  skippedCount: number
  errors: string[]
}

const normalizeName = (name: string) => name.trim().toLocaleLowerCase()

const generateCategoryId = (): CategoryId => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const findExistingByName = (categories: Category[], name: string) => {
  const key = normalizeName(name)
  return categories.find((c) => normalizeName(c.name) === key)
}

export const applyCategoryImport = (
  bundle: CategoryExportBundle,
  options: ApplyCategoryImportOptions = {}
): CategoryImportSummary => {
  const conflictStrategy = options.conflictStrategy ?? 'skip-by-name'
  const summary: CategoryImportSummary = { importedCount: 0, skippedCount: 0, errors: [] }

  if (conflictStrategy !== 'skip-by-name') {
    summary.errors.push(`Unsupported conflict strategy: ${conflictStrategy}`)
    return summary
  }

  const store = useCategoryStore.getState()
  const existing = store.categories

  const existingIdSet = new Set(existing.map((c) => c.id))

  for (const incoming of bundle.categories) {
    const incomingName = incoming.name?.trim() ?? ''
    if (!incomingName) {
      summary.skippedCount += 1
      summary.errors.push('Skipped a category with missing name.')
      continue
    }

    const nameConflict = findExistingByName(existing, incomingName)
    if (nameConflict) {
      summary.skippedCount += 1
      continue
    }

    let nextId: CategoryId | undefined
    if (incoming.id && !existingIdSet.has(incoming.id)) {
      nextId = incoming.id
    } else {
      nextId = generateCategoryId()
    }

    try {
      store.addCategory({
        id: nextId,
        name: incomingName,
        icon: incoming.icon,
        color: incoming.color,
        gradient: incoming.gradient,
        textColor: incoming.textColor,
        imagePath: incoming.imagePath,
        height: incoming.height,
        isPinned: Boolean(incoming.isPinned),
      })

      existingIdSet.add(nextId)
      summary.importedCount += 1
    } catch (err) {
      summary.skippedCount += 1
      summary.errors.push(
        err instanceof Error ? err.message : 'Failed to import a category due to an unknown error.'
      )
    }
  }

  return summary
}
