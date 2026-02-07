# Summary: Phase 5 - Integrate Tasks into Categories

**Status:** ✓ Complete

## What Was Built

Phase 5 integrates Tasks with the Categories system while preserving legacy task fields:
- Added `Task.categoryId?: string` as an optional association to HabitFlow Categories (kept legacy `Task.category: string`).
- Introduced a shared persisted `useTaskStore` (Zustand + persist) with one-time migration from legacy `localStorage['tasks']`.
- Categories page now derives `taskCount` from tasks, enables the Tasks filter chip, and updates filter/sort semantics.
- CategoryDetail now supports a Habits/Tasks/Both segmented toggle, shows category-scoped tasks, and provides an Add Task CTA.
- Tasks page supports deep-link task creation via `/tasks?new=1&categoryId=<id>`; TaskModal prefills `categoryId` only.
- Category deletion now detaches tasks by clearing `categoryId` (does not delete tasks).

## Tasks Completed

- ✓ Add optional `categoryId` to Task type - `c5fb455`
- ✓ Introduce persisted `useTaskStore` + legacy migration + Tasks page uses store - `416cae6`
- ✓ Add unit tests for `useTaskStore` helpers + migration - `25ee66f`
- ✓ Enable Tasks chip + taskCount integration + filter/sort updates + delete safety + update Categories UX test - `3099eac`
- ✓ CategoryDetail segmented toggle + tasks list + Add Task CTA - `84933cd`
- ✓ Tasks deep-link auto-open modal + TaskModal `categoryId` prefill - `a8fa83f`
- ✓ UI tests for task integration (Categories + CategoryDetail) - `414deb0`

## Deviations from Plan

- **Migration reliability fix:** Zustand persist does not always call `merge` when the persisted key is missing, so legacy migration was moved into `storage.getItem()` to ensure it runs on first hydration. This keeps plan behavior intact (legacy `tasks` migrate into `task-storage`).
- **CategoryDetail task list UI:** Implemented a lightweight task list in `CategoryDetail` rather than reusing `TaskCardWithMenu` directly (to avoid coupling to Tasks-page state). This meets Phase 5 scope (show tasks + toggle) with minimal UI duplication.
- **Test robustness:** Updated `Categories.ux` to use `findByText` for the deferred-search empty state to prevent timing flake (Categories uses `useDeferredValue`).

## Verification Results

Commands executed:
- `npm test -- src/__tests__/useTaskStore.test.ts`
- `npm test -- src/__tests__/Categories.ux.test.tsx`
- `npm test -- src/__tests__/Categories.tasks.test.tsx src/__tests__/CategoryDetail.tasks.test.tsx`
- Overall per plan: `npm test -- src/__tests__/useTaskStore.test.ts src/__tests__/Categories.tasks.test.tsx src/__tests__/CategoryDetail.tasks.test.tsx`

Result: **PASS** (with known pre-existing React `act(...)` warnings in some UI tests).

## Files Changed

- `src/types/task.ts`
- `src/store/useTaskStore.ts` (new)
- `src/pages/bottomNav/Tasks.tsx`
- `src/pages/bottomNav/Categories.tsx`
- `src/pages/CategoryDetail.tsx`
- `src/components/TaskModal.tsx`
- Tests:
  - `src/__tests__/useTaskStore.test.ts` (new)
  - `src/__tests__/Categories.tasks.test.tsx` (new)
  - `src/__tests__/CategoryDetail.tasks.test.tsx` (new)
  - `src/__tests__/Categories.ux.test.tsx` (updated)

## Next Steps

- (Optional) Enhance CategoryDetail task rendering by extracting a shared, store-backed `TaskCard` variant decoupled from Tasks page.
- (Optional) Add an automated test for category deletion detaching tasks using real store instances.
