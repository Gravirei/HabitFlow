# Implementation Plan: Habit Categories Management

This plan outlines the steps to fully integrate the dynamic category management system into the HabitFlow application, replacing the legacy hardcoded category system.

## Phase 1: Core Store & Data Refinement
Goal: Clean up data inconsistencies and ensure the stores are ready for unified category management.

- [ ] **Task: Refactor useHabitStore and useCategoryStore for Unification**
    - [ ] **Write Tests:** Create unit tests in `src/__tests__/store/categoryUnification.test.ts` to verify that habits can correctly link to dynamic categories and handle the transition from legacy `category` strings to `categoryId`.
    - [ ] **Implement:** Update `useHabitStore` and `useCategoryStore` to prioritize `categoryId`. Implement a robust migration helper that maps legacy `category` values to their new dynamic IDs once.
- [ ] **Task: Ensure Category ID Stability**
    - [ ] **Write Tests:** Verify that default categories (Health, Work, etc.) have stable IDs across sessions to avoid orphaned habits.
    - [ ] **Implement:** Hardcode the IDs for default categories in `src/constants/defaultCategories.ts`.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Core Store & Data Refinement' (Protocol in workflow.md)**

## Phase 2: Refactor Habits List UI
Goal: Update the main Habits page to use the dynamic categories from the store.

- [ ] **Task: Refactor HabitList to use Dynamic Categories**
    - [ ] **Write Tests:** Create unit tests in `src/__tests__/HabitList.dynamic.test.tsx` to verify that habits are correctly grouped by the categories in `useCategoryStore`.
    - [ ] **Implement:** Refactor `HabitList` in `src/pages/bottomNav/Habits.tsx` to remove hardcoded `getCategoryInfo` and instead map over categories from `useCategoryStore`.
- [ ] **Task: Implement Dynamic Category Headers**
    - [ ] **Write Tests:** Verify that headers display the correct icons, colors, and gradients from the store.
    - [ ] **Implement:** Update the category header UI in `Habits.tsx` to use store-provided visual metadata.
- [ ] **Task: Handle Uncategorized Habits**
    - [ ] **Write Tests:** Ensure habits without a category are displayed in a special "Uncategorized" section at the bottom.
    - [ ] **Implement:** Add a fallback group for uncategorized habits in the `HabitList` rendering logic.
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Refactor Habits List UI' (Protocol in workflow.md)**

## Phase 3: Selection and Management Integration
Goal: Complete the loop by updating habit creation/editing and polishing the management UI.

- [ ] **Task: Update Habit Creation and Edit Flows**
    - [ ] **Write Tests:** Create integration tests in `src/__tests__/HabitForm.categories.test.tsx` to verify that the category selector uses the dynamic list from the store.
    - [ ] **Implement:** Refactor `src/pages/NewHabit.tsx` and `src/components/categories/EditHabit.tsx` to use the dynamic category list.
- [ ] **Task: Add Category Statistics Computation**
    - [ ] **Write Tests:** Verify that `habitCount` and `completionRate` for categories are correctly computed in `useCategoryStore`.
    - [ ] **Implement:** Update the store or a selector to compute real-time statistics for each category based on its associated habits.
- [ ] **Task: UI Polish and Verification**
    - [ ] **Implement:** Ensure consistent styling between the `Categories` page tiles and the `Habits` list headers.
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Selection and Management Integration' (Protocol in workflow.md)**
