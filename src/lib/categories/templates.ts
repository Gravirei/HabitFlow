import {
  getCategoryTemplatePack,
  type CategoryTemplatePack,
  type TemplatePackCategory,
  type TemplatePackHabit,
} from '@/constants/categoryTemplatePacks'
import type { Category, CategoryId } from '@/types/category'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useHabitStore } from '@/store/useHabitStore'

export type TemplatePackImportSummary = {
  packId: CategoryTemplatePack['id']
  categories: {
    added: number
    skipped: number
  }
  habits: {
    added: number
    skipped: number
    renamed: number
  }
  errors: string[]
}

const normalizeName = (value: string) => value.trim().toLocaleLowerCase()

const findExistingCategoryByName = (categories: Category[], name: string) => {
  const key = normalizeName(name)
  return categories.find((c) => normalizeName(c.name) === key)
}

const generateCategoryId = (): CategoryId => `${Date.now()}-${Math.random().toString(16).slice(2)}`

type UniqueHabitNameResult =
  | { name: string; renamed: boolean }
  | { name: string; renamed: boolean; skip: true }

const ensureUniqueHabitName = (
  existingNames: Set<string>,
  desiredName: string
): UniqueHabitNameResult => {
  const trimmed = desiredName.trim()
  if (!trimmed) return { name: 'New Habit', renamed: true }

  if (!existingNames.has(normalizeName(trimmed))) {
    return { name: trimmed, renamed: false }
  }

  let i = 2
  while (i < 1000) {
    const candidate = `${trimmed} (${i})`
    if (!existingNames.has(normalizeName(candidate))) {
      return { name: candidate, renamed: true }
    }
    i += 1
  }

  // Give up and skip.
  return { name: trimmed, renamed: true, skip: true }
}

const addCategoryOrGetExisting = (categoryInput: TemplatePackCategory) => {
  const store = useCategoryStore.getState()
  const existing = findExistingCategoryByName(store.categories, categoryInput.name)
  if (existing) return { category: existing, wasAdded: false }

  const created = store.addCategory({
    id: generateCategoryId(),
    name: categoryInput.name,
    icon: categoryInput.icon,
    color: categoryInput.color,
    gradient: categoryInput.gradient,
    textColor: categoryInput.textColor,
    imagePath: categoryInput.imagePath,
    height: categoryInput.height,
    isPinned: Boolean(categoryInput.isPinned),
  })

  return { category: created, wasAdded: true }
}

const addHabitToCategory = (habitInput: TemplatePackHabit, categoryId: string) => {
  const habitStore = useHabitStore.getState()

  const existingNamesInCategory = new Set<string>(
    habitStore.habits.filter((h) => h.categoryId === categoryId).map((h) => normalizeName(h.name))
  )

  const unique = ensureUniqueHabitName(existingNamesInCategory, habitInput.name)
  if ('skip' in unique) {
    return { wasAdded: false, wasRenamed: false }
  }

  habitStore.addHabit({
    name: unique.name,
    description: habitInput.description,
    icon: habitInput.icon,
    frequency: habitInput.frequency,
    goal: habitInput.goal,
    goalPeriod: habitInput.goalPeriod,
    reminderEnabled: habitInput.reminderEnabled,
    reminderTime: habitInput.reminderTime,
    startDate: habitInput.startDate,
    categoryId,
  })

  return { wasAdded: true, wasRenamed: unique.renamed }
}

export const applyTemplatePack = (
  packId: CategoryTemplatePack['id']
): TemplatePackImportSummary => {
  const summary: TemplatePackImportSummary = {
    packId,
    categories: { added: 0, skipped: 0 },
    habits: { added: 0, skipped: 0, renamed: 0 },
    errors: [],
  }

  const pack = getCategoryTemplatePack(packId)
  if (!pack) {
    summary.errors.push(`Unknown template pack: ${packId}`)
    return summary
  }

  // 1) Add categories (skip duplicates by name)
  const categoryIdByName = new Map<string, string>()

  for (const category of pack.categories) {
    try {
      const result = addCategoryOrGetExisting(category)
      categoryIdByName.set(normalizeName(category.name), result.category.id)

      if (result.wasAdded) summary.categories.added += 1
      else summary.categories.skipped += 1
    } catch (err) {
      summary.categories.skipped += 1
      summary.errors.push(
        err instanceof Error ? err.message : `Failed to import category: ${category.name}`
      )
    }
  }

  // 2) Add sample habits
  for (const habit of pack.sampleHabits) {
    const categoryId = categoryIdByName.get(normalizeName(habit.categoryName))

    // If the category wasn't included in the pack for some reason, try to resolve from store.
    const resolvedCategoryId =
      categoryId ??
      findExistingCategoryByName(useCategoryStore.getState().categories, habit.categoryName)?.id

    if (!resolvedCategoryId) {
      summary.habits.skipped += 1
      summary.errors.push(
        `Skipped habit "${habit.name}": category not found (${habit.categoryName}).`
      )
      continue
    }

    try {
      const result = addHabitToCategory(habit, resolvedCategoryId)
      if (result.wasAdded) {
        summary.habits.added += 1
        if (result.wasRenamed) summary.habits.renamed += 1
      } else {
        summary.habits.skipped += 1
      }
    } catch (err) {
      summary.habits.skipped += 1
      summary.errors.push(err instanceof Error ? err.message : `Failed to add habit: ${habit.name}`)
    }
  }

  return summary
}
