# Test Gap Closure - Timer Module

## Overview
This phase fills identified test gaps in the Timer module's Zustand stores, AI Insights engine, Theme system, and Cloud Sync functionality.

## Execution Summary

| Plan | Objective | Tasks | Est. Tests | Wave |
|------|-----------|-------|------------|------|
| 1-1 | Zustand Stores Core (Achievements, Goals, Theme) | 3 | 50+ | 1 |
| 1-2 | Zustand Stores Premium (Tags, Archive, Notifications, Templates, Share) | 3 | 60+ | 1 |
| 1-3 | AI Insights Engine | 2 | 60+ | 1 |
| 1-4 | Theme System (ThemeProvider, ThemesModal) | 2 | 40+ | 2 |
| 2-1 | Cloud Sync (syncStore, CloudSyncModal, SyncOnAuthChange) | 3 | 50+ | 2 |

**Total: 13 tasks, 260+ new tests**

## Wave Execution

### Wave 1 (Parallel - No Dependencies)
Execute these plans simultaneously:
- `1-1-zustand-stores-core.PLAN.md`
- `1-2-zustand-stores-premium.PLAN.md`
- `1-3-ai-insights-engine.PLAN.md`

**Rationale**: These plans test independent modules with no cross-dependencies. Store tests follow the same pattern but operate on different stores. AI Insights tests pure functions.

### Wave 2 (After Wave 1)
Execute after Wave 1 completes:
- `1-4-theme-system.PLAN.md` (depends on themeStore testing patterns from 1-1)
- `2-1-cloud-sync.PLAN.md` (depends on store testing patterns from 1-1/1-2)

**Rationale**: These plans build on patterns established in Wave 1 and may reference the store tests for mocking approaches.

## Test Infrastructure Used

### Existing Setup
- **Framework**: Vitest
- **Component Testing**: React Testing Library
- **Test Setup**: `src/test/setup.ts` (localStorage/sessionStorage mocks, Notification API mock)
- **Test Utilities**: `src/test/test-utils.ts` (setupLocalStorage helper)

### Mocking Patterns

**Zustand Store Testing**:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyStore } from '../myStore'

beforeEach(() => {
  localStorage.clear()
  useMyStore.setState({ /* initial state */ })
})
```

**External Module Mocking**:
```typescript
vi.mock('@/lib/storage', () => ({
  tieredStorage: {
    isLoggedIn: vi.fn(),
    syncToCloud: vi.fn(),
    // ...
  },
}))
```

**DOM/Browser API Mocking**:
```typescript
// matchMedia for system theme
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: query === '(prefers-color-scheme: dark)',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
```

## File Structure After Completion

```
src/components/timer/
├── sidebar/
│   ├── achievements/
│   │   └── __tests__/
│   │       └── achievementsStore.test.ts     ← NEW (Plan 1-1)
│   ├── goals/
│   │   └── __tests__/
│   │       └── goalsStore.test.ts            ← NEW (Plan 1-1)
│   └── ai-insights/
│       └── __tests__/
│           ├── aiInsightsEngine.test.ts      ← NEW (Plan 1-3)
│           └── insightGenerators.test.ts     ← NEW (Plan 1-3)
├── themes/
│   └── __tests__/
│       ├── themeStore.test.ts                ← NEW (Plan 1-1)
│       ├── ThemeProvider.test.tsx            ← NEW (Plan 1-4)
│       └── ThemesModal.test.tsx              ← NEW (Plan 1-4)
└── premium-history/
    ├── archive/
    │   └── __tests__/
    │       └── archiveStore.test.ts          ← NEW (Plan 1-2)
    ├── cloud-sync/
    │   └── __tests__/
    │       ├── syncStore.test.ts             ← NEW (Plan 2-1)
    │       ├── CloudSyncModal.test.tsx       ← NEW (Plan 2-1)
    │       └── SyncOnAuthChange.test.tsx     ← NEW (Plan 2-1)
    ├── custom-tags/
    │   └── __tests__/
    │       └── tagStore.test.ts              ← NEW (Plan 1-2)
    ├── notifications/
    │   └── __tests__/
    │       └── notificationStore.test.ts     ← NEW (Plan 1-2)
    ├── session-templates/
    │   └── __tests__/
    │       └── templateStore.test.ts         ← NEW (Plan 1-2)
    └── team-sharing/
        └── __tests__/
            └── shareStore.test.ts            ← NEW (Plan 1-2)
```

## Success Criteria

1. **All 260+ tests pass**: `npm test src/components/timer` completes with no failures
2. **Coverage targets**:
   - Zustand stores: 90%+ line coverage
   - AI Insights engine: 95%+ line coverage (pure functions)
   - Theme system: 85%+ line coverage
   - Cloud sync: 85%+ line coverage (with mocked externals)
3. **No regressions**: Existing 174+ tests continue to pass
4. **Patterns documented**: New tests follow established patterns from existing test suite

## Verification Commands

```bash
# Run all new tests
npm test src/components/timer/sidebar/achievements/__tests__
npm test src/components/timer/sidebar/goals/__tests__
npm test src/components/timer/sidebar/ai-insights/__tests__
npm test src/components/timer/themes/__tests__
npm test src/components/timer/premium-history/archive/__tests__
npm test src/components/timer/premium-history/cloud-sync/__tests__
npm test src/components/timer/premium-history/custom-tags/__tests__
npm test src/components/timer/premium-history/notifications/__tests__
npm test src/components/timer/premium-history/session-templates/__tests__
npm test src/components/timer/premium-history/team-sharing/__tests__

# Run all timer tests with coverage
npm test -- --coverage src/components/timer

# Run full test suite to check for regressions
npm test
```

## Notes for Executors

1. **Store Reset Pattern**: Always reset store state in `beforeEach` using `useStore.setState()` - don't rely on localStorage clear alone due to Zustand's in-memory state.

2. **Date Mocking**: Use `vi.useFakeTimers()` and `vi.setSystemTime()` for date-dependent tests, especially in AI Insights.

3. **Async Store Actions**: Some store actions (like `startSync`) are async. Use `await act(async () => {...})` and `waitFor()` for these tests.

4. **DOM Cleanup**: React Testing Library's `cleanup()` is called automatically via setup.ts `afterEach`, but manually clear any global state modifications.

5. **Type Imports**: Import types from the store's `types.ts` file for creating mock data.
