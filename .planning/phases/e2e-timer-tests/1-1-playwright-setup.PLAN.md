# Plan: 1-1 - Playwright Setup & Configuration

## Objective
Install and configure Playwright for E2E testing with proper browser setup, test fixtures, and npm scripts.

## Context
- Project uses Vite + React 18 + TypeScript
- Existing tests use Vitest (unit/integration)
- No E2E tests currently exist
- Dev server runs on port 3000
- Package manager: npm

## Dependencies
- None (Wave 1)

## Tasks

<task type="auto">
<name>Install Playwright and create base configuration</name>
<files>package.json, playwright.config.ts, e2e/global-setup.ts</files>
<action>
1. Install Playwright and dependencies:
```bash
npm install -D @playwright/test
npx playwright install chromium firefox webkit
```

2. Create `playwright.config.ts` in project root:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

3. Create `e2e/global-setup.ts`:
```typescript
import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🎭 Playwright E2E Tests - Global Setup')
  // Any global setup logic (e.g., seeding test data)
}

export default globalSetup
```

4. Add npm scripts to `package.json`:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:report": "playwright show-report"
  }
}
```
</action>
<verify>
```bash
npx playwright --version
npm run test:e2e -- --help
```
Both commands should execute without errors.
</verify>
<done>Playwright installed, playwright.config.ts created with multi-browser support, npm scripts added</done>
</task>

<task type="auto">
<name>Create timer test fixtures for time mocking</name>
<files>e2e/fixtures/timer.fixture.ts</files>
<action>
Create `e2e/fixtures/timer.fixture.ts` with utilities for mocking time-based behavior:

```typescript
import { test as base, Page } from '@playwright/test'

// Custom fixture type
export type TimerFixtures = {
  mockTime: (timestamp: number) => Promise<void>
  advanceTime: (ms: number) => Promise<void>
  mockNotifications: () => Promise<void>
  mockAudio: () => Promise<void>
  waitForTimerUpdate: () => Promise<void>
}

export const test = base.extend<TimerFixtures>({
  // Mock Date.now() to a specific timestamp
  mockTime: async ({ page }, use) => {
    const mockTime = async (timestamp: number) => {
      await page.addInitScript(`{
        const originalDate = Date;
        let mockTimestamp = ${timestamp};
        
        Date = class extends originalDate {
          constructor(...args) {
            if (args.length === 0) {
              super(mockTimestamp);
            } else {
              super(...args);
            }
          }
          static now() {
            return mockTimestamp;
          }
        };
        
        window.__advanceTime = (ms) => {
          mockTimestamp += ms;
        };
        
        window.__setTime = (ts) => {
          mockTimestamp = ts;
        };
      }`)
    }
    await use(mockTime)
  },

  // Advance mocked time by milliseconds
  advanceTime: async ({ page }, use) => {
    const advanceTime = async (ms: number) => {
      await page.evaluate((milliseconds) => {
        if (window.__advanceTime) {
          window.__advanceTime(milliseconds)
        }
      }, ms)
    }
    await use(advanceTime)
  },

  // Mock Notification API
  mockNotifications: async ({ page }, use) => {
    const mockNotifications = async () => {
      await page.addInitScript(`{
        window.Notification = class {
          static permission = 'granted';
          static requestPermission() { return Promise.resolve('granted'); }
          constructor(title, options) {
            this.title = title;
            this.options = options;
            window.__lastNotification = { title, options };
          }
          close() {}
        };
      }`)
    }
    await use(mockNotifications)
  },

  // Mock Audio API
  mockAudio: async ({ page }, use) => {
    const mockAudio = async () => {
      await page.addInitScript(`{
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const OriginalAudioContext = window.AudioContext;
        
        window.AudioContext = class {
          constructor() {
            this.state = 'running';
            this.destination = {};
            this.currentTime = 0;
          }
          createOscillator() {
            return {
              connect: () => {},
              start: () => {},
              stop: () => {},
              type: 'sine',
              frequency: { setValueAtTime: () => {} }
            };
          }
          createGain() {
            return {
              connect: () => {},
              gain: { 
                setValueAtTime: () => {}, 
                linearRampToValueAtTime: () => {} 
              }
            };
          }
          resume() { return Promise.resolve(); }
          close() { return Promise.resolve(); }
        };
        
        // Mock HTMLAudioElement
        window.__audioPlayed = [];
        const OriginalAudio = window.Audio;
        window.Audio = class {
          constructor(src) {
            this.src = src;
            this.volume = 1;
            this.muted = false;
          }
          play() {
            window.__audioPlayed.push(this.src);
            return Promise.resolve();
          }
          pause() {}
          load() {}
        };
      }`)
    }
    await use(mockAudio)
  },

  // Wait for timer display to update
  waitForTimerUpdate: async ({ page }, use) => {
    const waitForTimerUpdate = async () => {
      await page.waitForTimeout(100) // Small delay for RAF
    }
    await use(waitForTimerUpdate)
  },
})

export { expect } from '@playwright/test'

// Declare global types for mocked functions
declare global {
  interface Window {
    __advanceTime?: (ms: number) => void
    __setTime?: (ts: number) => void
    __lastNotification?: { title: string; options: any }
    __audioPlayed?: string[]
  }
}
```
</action>
<verify>
```bash
# Verify file exists and TypeScript compiles
npx tsc --noEmit e2e/fixtures/timer.fixture.ts 2>/dev/null || echo "TypeScript check (may need config)"
ls -la e2e/fixtures/timer.fixture.ts
```
</verify>
<done>Timer fixture created with mockTime, advanceTime, mockNotifications, mockAudio, and waitForTimerUpdate utilities</done>
</task>

<task type="auto">
<name>Create storage fixture for localStorage mocking</name>
<files>e2e/fixtures/storage.fixture.ts, e2e/fixtures/index.ts</files>
<action>
1. Create `e2e/fixtures/storage.fixture.ts`:
```typescript
import { test as base, Page } from '@playwright/test'

export type StorageFixtures = {
  clearTimerStorage: () => Promise<void>
  seedTimerHistory: (sessions: any[]) => Promise<void>
  seedTimerSettings: (settings: any) => Promise<void>
  getStorageItem: (key: string) => Promise<any>
  setStorageItem: (key: string, value: any) => Promise<void>
}

// Timer storage keys
export const STORAGE_KEYS = {
  STOPWATCH_HISTORY: 'timer-stopwatch-history',
  COUNTDOWN_HISTORY: 'timer-countdown-history',
  INTERVALS_HISTORY: 'timer-intervals-history',
  TIMER_STATE: 'flowmodoro_timer_state',
  TIMER_SETTINGS: 'timer-settings',
  ACHIEVEMENTS: 'timer-sidebar-achievements',
  GOALS: 'timer-sidebar-goals',
  THEME: 'timer-theme-settings',
} as const

export const storageTest = base.extend<StorageFixtures>({
  // Clear all timer-related localStorage
  clearTimerStorage: async ({ page }, use) => {
    const clearTimerStorage = async () => {
      await page.evaluate((keys) => {
        Object.values(keys).forEach(key => {
          localStorage.removeItem(key)
        })
        // Also clear any flowmodoro prefixed items
        Object.keys(localStorage)
          .filter(k => k.startsWith('flowmodoro_') || k.startsWith('timer-'))
          .forEach(k => localStorage.removeItem(k))
      }, STORAGE_KEYS)
    }
    await use(clearTimerStorage)
  },

  // Seed timer history with mock sessions
  seedTimerHistory: async ({ page }, use) => {
    const seedTimerHistory = async (sessions: any[]) => {
      await page.evaluate((data) => {
        const { sessions, keys } = data
        const stopwatch: any[] = []
        const countdown: any[] = []
        const intervals: any[] = []

        sessions.forEach(session => {
          switch (session.mode) {
            case 'Stopwatch':
              stopwatch.push(session)
              break
            case 'Countdown':
              countdown.push(session)
              break
            case 'Intervals':
              intervals.push(session)
              break
          }
        })

        if (stopwatch.length) {
          localStorage.setItem(keys.STOPWATCH_HISTORY, JSON.stringify(stopwatch))
        }
        if (countdown.length) {
          localStorage.setItem(keys.COUNTDOWN_HISTORY, JSON.stringify(countdown))
        }
        if (intervals.length) {
          localStorage.setItem(keys.INTERVALS_HISTORY, JSON.stringify(intervals))
        }
      }, { sessions, keys: STORAGE_KEYS })
    }
    await use(seedTimerHistory)
  },

  // Seed timer settings
  seedTimerSettings: async ({ page }, use) => {
    const seedTimerSettings = async (settings: any) => {
      await page.evaluate((data) => {
        localStorage.setItem(data.key, JSON.stringify(data.settings))
      }, { key: STORAGE_KEYS.TIMER_SETTINGS, settings })
    }
    await use(seedTimerSettings)
  },

  // Get a localStorage item
  getStorageItem: async ({ page }, use) => {
    const getStorageItem = async (key: string) => {
      return await page.evaluate((k) => {
        const item = localStorage.getItem(k)
        return item ? JSON.parse(item) : null
      }, key)
    }
    await use(getStorageItem)
  },

  // Set a localStorage item
  setStorageItem: async ({ page }, use) => {
    const setStorageItem = async (key: string, value: any) => {
      await page.evaluate((data) => {
        localStorage.setItem(data.key, JSON.stringify(data.value))
      }, { key, value })
    }
    await use(setStorageItem)
  },
})

// Mock session generators
export function createMockStopwatchSession(overrides: Partial<any> = {}) {
  return {
    id: `sw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Stopwatch' as const,
    duration: 300, // 5 minutes in seconds
    timestamp: Date.now(),
    laps: [],
    sessionName: 'Test Stopwatch Session',
    ...overrides,
  }
}

export function createMockCountdownSession(overrides: Partial<any> = {}) {
  return {
    id: `cd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Countdown' as const,
    duration: 600, // 10 minutes in seconds
    initialDuration: 600,
    timestamp: Date.now(),
    completed: true,
    sessionName: 'Test Countdown Session',
    ...overrides,
  }
}

export function createMockIntervalsSession(overrides: Partial<any> = {}) {
  return {
    id: `iv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Intervals' as const,
    duration: 1500, // 25 minutes in seconds
    timestamp: Date.now(),
    workDuration: 25,
    breakDuration: 5,
    completedLoops: 4,
    targetLoopCount: 4,
    sessionName: 'Test Intervals Session',
    ...overrides,
  }
}

export { expect } from '@playwright/test'
```

2. Create `e2e/fixtures/index.ts` to merge all fixtures:
```typescript
import { mergeTests } from '@playwright/test'
import { test as timerTest, TimerFixtures } from './timer.fixture'
import { storageTest, StorageFixtures } from './storage.fixture'

// Merge all fixtures into a single test object
export const test = mergeTests(timerTest, storageTest)

export type AllFixtures = TimerFixtures & StorageFixtures

// Re-export utilities
export { expect } from '@playwright/test'
export { 
  STORAGE_KEYS,
  createMockStopwatchSession,
  createMockCountdownSession,
  createMockIntervalsSession,
} from './storage.fixture'
```
</action>
<verify>
```bash
ls -la e2e/fixtures/
cat e2e/fixtures/index.ts
```
Files should exist and export merged fixtures.
</verify>
<done>Storage fixture created with clearTimerStorage, seedTimerHistory, seedTimerSettings, mock session generators, and fixtures merged in index.ts</done>
</task>

## Success Criteria
- Playwright installed and configured for Chromium, Firefox, WebKit
- Mobile device configurations included (Pixel 5, iPhone 12)
- Timer fixture provides time mocking utilities
- Storage fixture provides localStorage mocking utilities
- npm scripts available: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:debug`
- Web server auto-starts on port 3000

## Verification
```bash
# Verify installation
npx playwright --version

# Verify fixtures exist
ls -la e2e/fixtures/

# Verify config
cat playwright.config.ts | head -20

# Verify npm scripts
npm run test:e2e -- --help
```
