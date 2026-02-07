import { z } from 'zod'
import type { Category } from '@/types/category'

/**
 * Canonical export bundle for category-related offline features (templates + import/export).
 *
 * v1: categories only (Phase 6 decision B1).
 */
export type CategoryExportVersion = 1

export type CategoryExportBundle = {
  version: CategoryExportVersion
  exportedAt: string
  categories: Category[]
}

// Keep the schema permissive to preserve forward compatibility.
export const CategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
    gradient: z.string().optional(),
    textColor: z.string().optional(),
    imagePath: z.string().optional(),
    height: z.string().optional(),
    isPinned: z.boolean(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    stats: z
      .object({
        habitCount: z.number(),
        taskCount: z.number(),
        completionRate: z.number(),
      })
      .passthrough(),
  })
  .passthrough()

export const CategoryExportBundleV1Schema = z
  .object({
    version: z.literal(1),
    exportedAt: z.string(),
    categories: z.array(CategorySchema),
  })
  .passthrough()

export type CategoryExportBundleV1 = z.infer<typeof CategoryExportBundleV1Schema>
