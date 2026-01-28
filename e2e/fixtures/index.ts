import { mergeTests } from '@playwright/test'
import { test as timerTest, TimerFixtures } from './timer.fixture'
import { storageTest as storageTestBase, StorageFixtures } from './storage.fixture'

// Merge all fixtures into a single test object
export const test = mergeTests(timerTest, storageTestBase)

export type AllFixtures = TimerFixtures & StorageFixtures

// Re-export utilities
export { expect } from '@playwright/test'
export { 
  STORAGE_KEYS,
  createMockStopwatchSession,
  createMockCountdownSession,
  createMockIntervalsSession,
} from './storage.fixture'
