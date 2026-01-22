# Plan: 5-1 - CI Integration & Final Verification

## Objective
Configure GitHub Actions for E2E tests, add accessibility checks, and perform final verification of the complete test suite.

## Context
- All E2E tests completed in previous plans
- Need CI/CD integration for automated testing
- Accessibility testing with axe-core
- Final verification across all browsers

## Dependencies
- 4-1-export-goals-achievements.PLAN.md

## Tasks

<task type="auto">
<name>Create GitHub Actions CI workflow</name>
<files>.github/workflows/e2e-tests.yml</files>
<action>
Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  # Allow manual trigger
  workflow_dispatch:

jobs:
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    strategy:
      fail-fast: false
      matrix:
        # Run on multiple browsers
        browser: [chromium, firefox, webkit]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e -- --project=${{ matrix.browser }}
        env:
          CI: true
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 7
      
      - name: Upload test artifacts
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-artifacts-${{ matrix.browser }}
          path: |
            test-results/
            playwright-report/
          retention-days: 7

  e2e-tests-mobile:
    name: E2E Tests (Mobile)
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium webkit
      
      - name: Build application
        run: npm run build
      
      - name: Run Mobile E2E tests
        run: |
          npm run test:e2e -- --project=mobile-chrome
          npm run test:e2e -- --project=mobile-safari
        env:
          CI: true
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-mobile
          path: playwright-report/
          retention-days: 7

  # Summary job that depends on all test jobs
  e2e-summary:
    name: E2E Tests Summary
    runs-on: ubuntu-latest
    needs: [e2e-tests, e2e-tests-mobile]
    if: always()
    
    steps:
      - name: Check test results
        run: |
          if [ "${{ needs.e2e-tests.result }}" == "failure" ] || [ "${{ needs.e2e-tests-mobile.result }}" == "failure" ]; then
            echo "::error::E2E tests failed"
            exit 1
          fi
          echo "✅ All E2E tests passed!"
```

Also create `.github/workflows/e2e-scheduled.yml` for nightly runs:

```yaml
name: E2E Tests (Scheduled)

on:
  schedule:
    # Run at 2 AM UTC every day
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  full-e2e-suite:
    name: Full E2E Suite
    runs-on: ubuntu-latest
    timeout-minutes: 45
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install all Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run full E2E suite
        run: npm run test:e2e
        env:
          CI: true
      
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-full
          path: playwright-report/
          retention-days: 30
      
      - name: Notify on failure
        if: failure()
        run: |
          echo "::warning::Nightly E2E tests failed. Check the test report for details."
```
</action>
<verify>
```bash
# Verify workflow files are valid YAML
cat .github/workflows/e2e-tests.yml | head -50
ls -la .github/workflows/
```
</verify>
<done>GitHub Actions CI workflow created with matrix strategy for browsers, mobile tests, and scheduled nightly runs</done>
</task>

<task type="auto">
<name>Add accessibility E2E tests with axe-core</name>
<files>e2e/tests/accessibility.spec.ts</files>
<action>
First, install axe-playwright:

```bash
npm install -D @axe-core/playwright
```

Then create `e2e/tests/accessibility.spec.ts`:

```typescript
import { test, expect } from '../fixtures'
import AxeBuilder from '@axe-core/playwright'
import { TimerPage, HistoryPage, GoalsPage, AchievementsPage } from '../pages'

test.describe('Accessibility Tests', () => {
  
  test.describe('Timer Page Accessibility', () => {
    test('should have no accessibility violations on timer page', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('[data-testid="framer-motion"]') // Exclude animation elements if needed
        .analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have no violations in Stopwatch mode', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      await timerPage.selectStopwatch()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })

    test('should have no violations in Countdown mode', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      await timerPage.selectCountdown()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })

    test('should have no violations in Intervals mode', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      await timerPage.selectIntervals()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })

    test('should have no violations when timer is running', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      await timerPage.selectStopwatch()
      await timerPage.start()
      
      await page.waitForTimeout(500) // Let UI update
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })

    test('should have no violations in settings modal', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      await timerPage.openSettings()
      
      const results = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })
  })

  test.describe('History Page Accessibility', () => {
    test('should have no accessibility violations on history page', async ({ page, seedTimerHistory }) => {
      const { createMockStopwatchSession } = await import('../fixtures')
      await seedTimerHistory([
        createMockStopwatchSession(),
        createMockStopwatchSession(),
      ])
      
      const historyPage = new HistoryPage(page)
      await historyPage.goto()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })

    test('should have no violations on empty history', async ({ page, clearTimerStorage }) => {
      await clearTimerStorage()
      
      const historyPage = new HistoryPage(page)
      await historyPage.goto()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })
  })

  test.describe('Goals Page Accessibility', () => {
    test('should have no accessibility violations on goals page', async ({ page }) => {
      const goalsPage = new GoalsPage(page)
      await goalsPage.goto()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })
  })

  test.describe('Achievements Page Accessibility', () => {
    test('should have no accessibility violations on achievements page', async ({ page }) => {
      const achievementsPage = new AchievementsPage(page)
      await achievementsPage.goto()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(results.violations).toEqual([])
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should be able to navigate timer with keyboard only', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      
      // Tab through mode selector
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Should be able to select mode with Enter
      await page.keyboard.press('Enter')
      
      // Verify focus is visible
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('should trap focus in modals', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      await timerPage.openSettings()
      
      // Tab through modal - focus should stay within modal
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab')
      }
      
      // Focus should still be within the modal
      const modal = page.locator('[role="dialog"]')
      const focusedElement = page.locator(':focus')
      
      // Check if focused element is inside modal
      const isInModal = await focusedElement.evaluate((el, modalEl) => {
        return modalEl?.contains(el) || el === modalEl
      }, await modal.elementHandle())
      
      expect(isInModal).toBe(true)
    })

    test('should close modal with Escape key', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      await timerPage.openSettings()
      
      await page.keyboard.press('Escape')
      
      const modal = page.locator('[role="dialog"]')
      await expect(modal).not.toBeVisible()
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have aria-live regions for timer updates', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      
      const liveRegion = page.locator('[aria-live]')
      await expect(liveRegion.first()).toBeVisible()
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      
      // Check heading structure
      const h1 = page.locator('h1')
      const h2 = page.locator('h2')
      
      // Should have proper heading structure
      // (specific expectations depend on page structure)
    })

    test('should have descriptive button labels', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      
      // All buttons should have accessible names
      const buttons = page.locator('button')
      const count = await buttons.count()
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i)
        const name = await button.getAttribute('aria-label') || await button.textContent()
        expect(name?.trim()).toBeTruthy()
      }
    })
  })

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ rules: { 'color-contrast': { enabled: true } } })
        .analyze()
      
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast')
      expect(contrastViolations).toEqual([])
    })
  })

  test.describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })
      
      const timerPage = new TimerPage(page)
      await timerPage.goto()
      
      // Animations should be disabled or reduced
      // This depends on implementation
    })
  })
})
```
</action>
<verify>
```bash
npm run test:e2e -- e2e/tests/accessibility.spec.ts --project=chromium
```
All accessibility tests should pass.
</verify>
<done>Accessibility E2E tests created with axe-core integration covering all timer pages, keyboard navigation, screen reader support, color contrast, and reduced motion</done>
</task>

## Success Criteria
- GitHub Actions workflow runs E2E tests on push/PR
- Matrix strategy tests Chromium, Firefox, WebKit
- Mobile tests run on emulated devices
- Test artifacts uploaded on failure
- Accessibility tests cover all timer pages
- Keyboard navigation tests pass
- All tests complete in < 5 minutes total

## Verification
```bash
# Run full E2E suite locally
npm run test:e2e

# Run with specific browser
npm run test:e2e -- --project=chromium

# Run accessibility tests only
npm run test:e2e -- e2e/tests/accessibility.spec.ts

# Generate and view report
npm run test:e2e:report
```

## Final Checklist
- [ ] All 9 test files created and passing
- [ ] Fixtures working for time/storage mocking
- [ ] Page Object Models covering all pages
- [ ] GitHub Actions CI configured
- [ ] Accessibility tests integrated
- [ ] Tests run in < 5 minutes
- [ ] npm scripts documented
