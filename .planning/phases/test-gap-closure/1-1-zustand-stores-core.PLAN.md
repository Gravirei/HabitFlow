# Plan: 1-1 - Zustand Stores Core Tests (Achievements, Goals, Theme)

## Objective
Create comprehensive unit tests for the three core Zustand stores: achievementsStore, goalsStore, and themeStore.

## Context
- Test framework: Vitest with React Testing Library
- Existing test patterns: See `src/__tests__/useHabitStore.test.ts` for store testing patterns
- Test setup: `src/test/setup.ts` provides localStorage mocking
- All stores use Zustand's `persist` middleware with localStorage

## Dependencies
- None (Wave 1)

## Tasks

<task type="auto">
<name>Create achievementsStore tests</name>
<files>src/components/timer/sidebar/achievements/__tests__/achievementsStore.test.ts</files>
<action>
Create comprehensive tests for `useAchievementsStore`:

1. **Setup**: 
   - Import from vitest, @testing-library/react
   - Clear localStorage and reset store state before each test
   - Mock `ACHIEVEMENT_DEFINITIONS` if needed for predictable testing

2. **Test Groups**:
   - **Initial State**: Verify empty achievements array on fresh store
   - **initializeAchievements**: 
     - Should populate achievements from ACHIEVEMENT_DEFINITIONS
     - Should not reinitialize if achievements already exist
     - Should set correct initial values (unlocked: false, progress: 0)
   - **updateAchievements**: 
     - Should update progress based on UserStats
     - Should unlock achievement when progress >= requirement
     - Should set unlockedAt date when newly unlocked
     - Should skip already unlocked achievements
   - **unlockAchievement**: 
     - Should manually unlock by ID
     - Should set progress to requirement
     - Should set unlockedAt date
     - Should not re-unlock already unlocked
   - **Getter Methods**:
     - getUnlockedAchievements: filter unlocked
     - getLockedAchievements: filter locked
     - getAchievementById: find by ID, return undefined for missing
     - getAchievementsByCategory: filter by category
     - getAchievementsByRarity: filter by rarity
   - **resetAchievements**: 
     - Should reset all to unlocked: false, progress: 0
     - Should clear unlockedAt dates
   - **Persistence**: Verify localStorage key 'timer-sidebar-achievements'

3. **Pattern to follow**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAchievementsStore } from '../achievementsStore'

describe('useAchievementsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset store state
    useAchievementsStore.setState({ achievements: [] })
  })
  // ... tests
})
```
</action>
<verify>Run `npm test src/components/timer/sidebar/achievements/__tests__/achievementsStore.test.ts` - all tests pass</verify>
<done>achievementsStore has 15+ tests covering all actions, getters, edge cases, and persistence</done>
</task>

<task type="auto">
<name>Create goalsStore tests</name>
<files>src/components/timer/sidebar/goals/__tests__/goalsStore.test.ts</files>
<action>
Create comprehensive tests for `useGoalsStore`:

1. **Setup**:
   - Mock Date.now() for predictable IDs
   - Clear localStorage before each test
   - Reset store state

2. **Test Groups**:
   - **Initial State**: Empty goals array
   - **addGoal**:
     - Should create goal with generated ID, current: 0, status: 'active', createdAt
     - Should preserve provided fields (name, type, period, target, mode)
   - **updateGoal**: 
     - Should update specified fields by ID
     - Should not affect other goals
   - **deleteGoal**: 
     - Should remove goal by ID
     - Should handle non-existent ID gracefully
   - **updateGoalProgress**:
     - Should update current value
     - Should auto-complete when progress >= target
     - Should set completedAt on auto-complete
     - Should handle non-existent goal gracefully
   - **completeGoal**: 
     - Should set status to 'completed' and completedAt
   - **pauseGoal/resumeGoal**: 
     - Should toggle status between 'paused' and 'active'
   - **Getter Methods**:
     - getActiveGoals: filter by status 'active'
     - getCompletedGoals: filter by status 'completed'
     - getGoalById: find by ID
   - **Persistence**: Verify localStorage key 'timer-sidebar-goals'

3. **Edge Cases**:
   - Multiple goals with different statuses
   - Goal progress exactly at target
   - Goal progress exceeding target
</action>
<verify>Run `npm test src/components/timer/sidebar/goals/__tests__/goalsStore.test.ts` - all tests pass</verify>
<done>goalsStore has 15+ tests covering all CRUD operations, status transitions, and edge cases</done>
</task>

<task type="auto">
<name>Create themeStore tests</name>
<files>src/components/timer/themes/__tests__/themeStore.test.ts</files>
<action>
Create comprehensive tests for `useThemeStore`:

1. **Setup**:
   - Clear localStorage before each test
   - Reset store to defaults

2. **Test Groups**:
   - **Initial State/Defaults**:
     - mode: 'dark'
     - preset: 'ultra-dark'
     - accentColor: 'violet'
     - All default effect values (glowEnabled: true, blurEnabled: true, etc.)
   - **Individual Setters** (test each one):
     - setMode: 'dark', 'light', 'system'
     - setPreset: various preset names
     - setAccentColor: various colors
     - setGradientBackground: string or null
     - setCustomBackgroundUrl: string or null
     - setTimerStyle: 'default', other styles
     - setGlowEnabled, setBlurEnabled, setParticlesEnabled: boolean
     - setBorderRadius: number
     - setButtonStyle: 'rounded', other styles
     - setFontFamily: 'system', 'inter', etc.
     - setTimerSize: number (percentage)
     - setReducedMotion, setHighContrast: boolean
   - **Bulk Update (updateTheme)**:
     - Should merge partial updates
     - Should preserve unspecified values
   - **resetToDefaults**:
     - Should restore all values to DEFAULT_THEME
   - **Persistence**: Verify localStorage key 'timer-theme-settings'

3. **Pattern**:
```typescript
describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.getState().resetToDefaults()
  })
  
  describe('setMode', () => {
    it('should update mode to light', () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => result.current.setMode('light'))
      expect(result.current.mode).toBe('light')
    })
  })
})
```
</action>
<verify>Run `npm test src/components/timer/themes/__tests__/themeStore.test.ts` - all tests pass</verify>
<done>themeStore has 20+ tests covering all 15 setters, bulk update, reset, and persistence</done>
</task>

## Success Criteria
- All three store test files created in `__tests__` directories
- 50+ total tests across the three stores
- All tests pass with `npm test`
- Tests cover initial state, all actions, getters, edge cases, and persistence

## Verification
```bash
npm test src/components/timer/sidebar/achievements/__tests__/achievementsStore.test.ts
npm test src/components/timer/sidebar/goals/__tests__/goalsStore.test.ts
npm test src/components/timer/themes/__tests__/themeStore.test.ts
```
