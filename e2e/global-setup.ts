import { FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
  console.log('🎭 Playwright E2E Tests - Global Setup')
  // Any global setup logic (e.g., seeding test data)
}

export default globalSetup
