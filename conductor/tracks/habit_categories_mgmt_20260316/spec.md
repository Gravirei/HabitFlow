# Track: Implement Habit Categories Management

## Overview
This track focuses on the complete integration of the dynamic category management system into the core habit tracking experience. Currently, the application uses a mix of hardcoded legacy categories and a newer, but partially integrated, dynamic category system. Our goal is to unify these under the dynamic `useCategoryStore`.

## Requirements
1.  **Unified Category System:** All habits must use `categoryId` from `useCategoryStore` instead of the legacy `category` field.
2.  **Dynamic Habits List:** The `Habits` page must group habits by the dynamic categories defined in `useCategoryStore`.
3.  **Dynamic Category Card:** Use icons, colors, and gradients defined in `useCategoryStore` in all UI elements.
4.  **Habit Creation/Edit:** Ensure the `NewHabit` and `EditHabit` flows allow users to select from the dynamic list of categories.
5.  **Uncategorized Support:** Provide a clean way to handle and group habits that don't belong to any category.
6.  **TDD Coverage:** All new or refactored logic must have >80% unit test coverage.

## Tech Stack
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (useCategoryStore, useHabitStore)
- **dnd-kit** (for reordering)
- **Vitest** (for testing)
