# Testing Patterns

**Analysis Date:** 2025-03-10

## Test Framework

**Runner:**
- Vitest (for unit and integration tests)
- Playwright (for E2E tests)

**Assertion Library:**
- `expect` from Vitest (extended by `jest-dom` for DOM assertions)
- `expect` from Playwright (for E2E assertions)

**Run Commands:**
```bash
npm run test           # Run all unit/integration tests
npm run test:ui        # Run Vitest in UI mode
npm run test:coverage  # Generate coverage reports
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run Playwright in UI mode
```

## Test File Organization

**Location:**
- Unit/Integration: `src/__tests__/` (for store and component-specific tests) or `src/test/` (general setup).
- E2E: `e2e/tests/` (test specs), `e2e/pages/` (Page Object Models), `e2e/fixtures/` (test fixtures).

**Naming:**
- `.test.ts`, `.test.tsx` for unit/integration tests.
- `.spec.ts` for E2E tests.

**Structure:**
```
src/__tests__/
  ├── useHabitStore.test.ts
  ├── Categories.ux.test.tsx
  └── ...
e2e/
  ├── tests/
  │   ├── timer-countdown.spec.ts
  │   └── ...
  ├── pages/
  │   ├── timer.page.ts
  │   └── ...
  └── fixtures/
      ├── index.ts
      └── ...
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStore } from '@/store/useStore'

describe('Store/Component Name', () => {
  beforeEach(() => {
    // Setup logic, mocks, etc.
  })

  it('should perform a specific action', () => {
    // Arrange, Act, Assert
  })
})
```

**Patterns:**
- **Setup:** `beforeEach` is used to reset state and clear mocks (e.g., `src/test/setup.ts`).
- **Assertion:** Standard Vitest `expect` with `jest-dom` matchers (e.g., `toBeVisible()`).
- **Hooks:** `renderHook` from `@testing-library/react` is used for testing Zustand stores.
- **State Changes:** `act` is used to wrap calls that update state in hooks/stores.

## Mocking

**Framework:** Vitest `vi` (e.g., `vi.fn()`, `vi.mock()`).

**Patterns:**
```typescript
// From src/test/setup.ts
Object.defineProperty(window, 'Notification', {
  value: class Notification {
    static permission = 'default'
    static requestPermission = vi.fn().mockResolvedValue('granted')
    constructor(title: string, options?: NotificationOptions) {
      return { title, ...options }
    }
  },
  writable: true,
  configurable: true,
})
```

**What to Mock:**
- Browser APIs (`localStorage`, `sessionStorage`, `Notification`, `Date.now()`).
- External service calls (Supabase, Sentry).
- Large or slow dependencies that are not relevant to the unit being tested.

**What NOT to Mock:**
- Core business logic.
- Small, pure utility functions.

## Fixtures and Factories

**Test Data:**
```typescript
// Using constants as test data
import { SAMPLE_HABITS } from '@/constants/sampleData'

// E2E fixtures in e2e/fixtures/
export const test = base.extend<MyFixtures>({
  clearTimerStorage: async ({ page }, use) => {
    await use(async () => {
      await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEYS.TIMER_SESSIONS);
    });
  },
});
```

**Location:**
- Unit/Integration: `src/constants/sampleData.ts`.
- E2E: `e2e/fixtures/`.

## Coverage

**Requirements:** No specific target enforced in `package.json`, but coverage reports are available via `npm run test:coverage`.

**View Coverage:**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests:**
- Focus on stores (`src/store/`) and utility functions (`src/utils/`).
- Located in `src/__tests__/`.

**Integration Tests:**
- Focus on complex components and their interaction with stores.
- Also located in `src/__tests__/`.

**E2E Tests:**
- Full application flow tests (Auth, Timer, Habits).
- Located in `e2e/tests/`.
- Uses Page Object Model (POM) pattern for better maintainability.

## Common Patterns

**Async Testing:**
- Use `await` with `@testing-library` queries like `findByText`.
- For E2E, Playwright handles async waiting natively.

**Error Testing:**
- `expect(() => functionThatThrows()).toThrow()`.
- Error boundary tests (e.g., `src/components/ErrorBoundary.tsx` usage).

**A11y Testing:**
- `vitest-axe` and `jest-axe` are present in dependencies for accessibility testing.

---

*Testing analysis: 2025-03-10*
