# Coding Conventions

**Analysis Date:** 2025-03-10

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `src/components/habits/SelectPinHabitsModal.tsx`, `src/App.tsx`)
- Hooks/Stores: camelCase with `use` prefix (e.g., `src/store/useHabitStore.ts`, `src/hooks/useDayChangeDetector.ts`)
- Utils: camelCase (e.g., `src/utils/dateUtils.ts`, `src/utils/cn.ts`)
- Types: camelCase (e.g., `src/types/habit.ts`, `src/types/category.ts`)
- Test files: `.test.ts`, `.test.tsx`, or `.spec.ts` suffix (e.g., `src/__tests__/useHabitStore.test.ts`, `e2e/tests/timer-countdown.spec.ts`)

**Functions:**
- Component functions: PascalCase (e.g., `export function SelectPinHabitsModal(...)`)
- Regular functions/Hooks: camelCase (e.g., `export const useHabitStore = ...`, `function DayChangeDetector()`)

**Variables:**
- General: camelCase
- Constants: UPPER_SNAKE_CASE (e.g., `SAMPLE_HABITS` in `src/constants/sampleData.ts`)

**Types:**
- Interfaces: PascalCase (e.g., `interface HabitState`, `interface SelectPinHabitsModalProps`)
- Types: PascalCase (e.g., `type Habit = { ... }`)

## Code Style

**Formatting:**
- Tool: Prettier
- Settings (from `.prettierrc`):
  - `semi: false` (No semicolons)
  - `singleQuote: true` (Single quotes)
  - `tabWidth: 2`
  - `trailingComma: "es5"`
  - `printWidth: 100`
  - Plugin: `prettier-plugin-tailwindcss` for class sorting.

**Linting:**
- Tool: ESLint
- Config: `.eslintrc.cjs` using `eslint:recommended`, `plugin:@typescript-eslint/recommended`, and `plugin:react-hooks/recommended`.
- Rules: `react-refresh/only-export-components` is warned for non-constant exports.

## Import Organization

**Order:**
1. React and React-related libraries (e.g., `react-router-dom`)
2. External libraries (e.g., `zustand`, `date-fns`, `framer-motion`)
3. Internal modules using `@/` alias (e.g., `@/store/...`, `@/components/...`, `@/utils/...`)
4. CSS/Assets (e.g., `import './index.css'`)

**Path Aliases:**
- `@/`: Maps to `src/` directory (configured in `tsconfig.json` and `vite.config.ts`).

## Error Handling

**Patterns:**
- Use `ErrorBoundary` component for catching React-level errors (e.g., `src/components/ErrorBoundary.tsx` wrapped around `App`).
- Sentry integration for error tracking (e.g., `src/lib/sentry.ts`).
- `try-catch` blocks in stores and utilities, especially for side effects like `localStorage` access.

## Logging

**Framework:** `console` and Sentry.

**Patterns:**
- Sentry is used for capturing exceptions in production.
- Console logging is used sparingly in development.

## Comments

**When to Comment:**
- To describe complex logic or business rules (e.g., midnight rollover logic in `App.tsx`).
- To provide context for architectural decisions (e.g., "ARCHIVED: ThemeProvider import removed").
- JSDoc for complex functions and store methods.

**JSDoc/TSDoc:**
- Observed in stores and complex components to describe methods and props.

## Function Design

**Size:** Components and functions are generally focused, but some stores and utility files can grow large (e.g., `useHabitStore.ts` is ~300 lines).

**Parameters:** Prefer object destructuring for component props and complex function arguments.

**Return Values:** Hooks return arrays (rare) or objects (common for stores/complex hooks).

## Module Design

**Exports:**
- Named exports are preferred for most components, stores, and utils (e.g., `export function Component()`, `export const useStore = ...`).
- Default export is used for the main `App` component and some pages.

**Barrel Files:**
- Used in some directories like `src/components/auth/` or `e2e/fixtures/index.ts` to simplify imports.

---

*Convention analysis: 2025-03-10*
