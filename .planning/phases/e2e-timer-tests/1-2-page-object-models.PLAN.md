# Plan: 1-2 - Page Object Models

## Objective
Create Page Object Model classes for Timer pages to encapsulate page interactions and selectors.

## Context
- Timer module has 7 routes to test
- POM pattern improves test maintainability
- Selectors should use data-testid, role, or accessible names
- Components use Framer Motion animations (need to wait for animations)

## Dependencies
- None (Wave 1)

## Tasks

<task type="auto">
<name>Create Timer page object model</name>
<files>e2e/pages/timer.page.ts</files>
<action>
Create `e2e/pages/timer.page.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test'

export class TimerPage {
  readonly page: Page
  
  // Mode tabs
  readonly modeTabList: Locator
  readonly stopwatchTab: Locator
  readonly countdownTab: Locator
  readonly intervalsTab: Locator
  
  // Timer display
  readonly timerDisplay: Locator
  readonly timerTime: Locator
  
  // Control buttons
  readonly startButton: Locator
  readonly pauseButton: Locator
  readonly stopButton: Locator
  readonly resetButton: Locator
  readonly lapButton: Locator
  
  // Countdown specific
  readonly wheelPicker: Locator
  readonly presetButtons: Locator
  
  // Intervals specific
  readonly workDurationInput: Locator
  readonly breakDurationInput: Locator
  readonly loopCountInput: Locator
  readonly intervalStatus: Locator
  
  // Navigation
  readonly settingsButton: Locator
  readonly historyButton: Locator
  readonly menuButton: Locator

  constructor(page: Page) {
    this.page = page
    
    // Mode tabs
    this.modeTabList = page.getByRole('tablist', { name: 'Timer modes' })
    this.stopwatchTab = page.getByRole('tab', { name: /stopwatch/i })
    this.countdownTab = page.getByRole('tab', { name: /countdown/i })
    this.intervalsTab = page.getByRole('tab', { name: /intervals/i })
    
    // Timer display - use text pattern for time display
    this.timerDisplay = page.locator('[class*="timer-display"], [data-testid="timer-display"]').first()
    this.timerTime = page.locator('text=/\\d{1,2}:\\d{2}(:\\d{2})?/').first()
    
    // Control buttons - primary action button
    this.startButton = page.getByRole('button', { name: /start/i })
    this.pauseButton = page.getByRole('button', { name: /pause/i })
    this.stopButton = page.getByRole('button', { name: /stop/i })
    this.resetButton = page.getByRole('button', { name: /reset/i })
    this.lapButton = page.getByRole('button', { name: /lap/i })
    
    // Countdown specific
    this.wheelPicker = page.locator('[data-testid="wheel-picker"]')
    this.presetButtons = page.locator('[data-testid="preset-button"]')
    
    // Intervals specific
    this.workDurationInput = page.locator('[data-testid="work-duration"]')
    this.breakDurationInput = page.locator('[data-testid="break-duration"]')
    this.loopCountInput = page.locator('[data-testid="loop-count"]')
    this.intervalStatus = page.locator('[data-testid="interval-status"]')
    
    // Navigation
    this.settingsButton = page.getByRole('button', { name: /settings/i })
    this.historyButton = page.getByRole('button', { name: /history/i })
    this.menuButton = page.getByRole('button', { name: /menu/i })
  }

  async goto() {
    await this.page.goto('/timer')
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    await this.modeTabList.waitFor({ state: 'visible' })
  }

  // Mode selection
  async selectStopwatch() {
    await this.stopwatchTab.click()
    await this.page.waitForTimeout(300) // Animation
  }

  async selectCountdown() {
    await this.countdownTab.click()
    await this.page.waitForTimeout(300)
  }

  async selectIntervals() {
    await this.intervalsTab.click()
    await this.page.waitForTimeout(300)
  }

  async getCurrentMode(): Promise<string> {
    const selected = await this.modeTabList.locator('[aria-selected="true"]').textContent()
    return selected?.trim() || ''
  }

  // Timer controls
  async start() {
    await this.startButton.click()
    await this.page.waitForTimeout(100)
  }

  async pause() {
    await this.pauseButton.click()
    await this.page.waitForTimeout(100)
  }

  async stop() {
    await this.stopButton.click()
    await this.page.waitForTimeout(100)
  }

  async reset() {
    await this.resetButton.click()
    await this.page.waitForTimeout(100)
  }

  async addLap() {
    await this.lapButton.click()
  }

  // Get current time display
  async getDisplayedTime(): Promise<string> {
    const timeText = await this.timerTime.textContent()
    return timeText?.trim() || '0:00'
  }

  // Countdown specific
  async setCountdownTime(minutes: number) {
    // Click on preset if available, or use wheel picker
    const presetBtn = this.page.getByRole('button', { name: new RegExp(`${minutes}\\s*min`, 'i') })
    if (await presetBtn.isVisible()) {
      await presetBtn.click()
    }
  }

  async selectPreset(presetName: string) {
    await this.page.getByRole('button', { name: new RegExp(presetName, 'i') }).click()
  }

  // Intervals specific
  async configureIntervals(work: number, breakTime: number, loops: number) {
    // This will depend on the actual UI - adjust selectors as needed
    await this.page.fill('[data-testid="work-duration"]', work.toString())
    await this.page.fill('[data-testid="break-duration"]', breakTime.toString())
    await this.page.fill('[data-testid="loop-count"]', loops.toString())
  }

  async getIntervalStatus(): Promise<{ type: string; count: number }> {
    const statusText = await this.intervalStatus.textContent()
    const isWork = statusText?.toLowerCase().includes('work')
    const countMatch = statusText?.match(/(\d+)/)
    return {
      type: isWork ? 'work' : 'break',
      count: countMatch ? parseInt(countMatch[1]) : 0
    }
  }

  // Settings modal
  async openSettings() {
    await this.settingsButton.click()
    await this.page.waitForSelector('[role="dialog"]')
  }

  // History modal
  async openHistory() {
    await this.historyButton.click()
    await this.page.waitForSelector('[role="dialog"]')
  }

  // Session completion modal
  async waitForCompletionModal() {
    await this.page.waitForSelector('[data-testid="completion-modal"], [role="dialog"]:has-text("Complete")')
  }

  async saveSession(name?: string) {
    if (name) {
      await this.page.fill('[data-testid="session-name"], input[placeholder*="name"]', name)
    }
    await this.page.getByRole('button', { name: /save/i }).click()
  }

  async discardSession() {
    await this.page.getByRole('button', { name: /discard|cancel/i }).click()
  }
}
```
</action>
<verify>
```bash
ls -la e2e/pages/timer.page.ts
```
</verify>
<done>Timer page object model created with mode selection, timer controls, countdown/intervals helpers, and modal interactions</done>
</task>

<task type="auto">
<name>Create History page object model</name>
<files>e2e/pages/history.page.ts</files>
<action>
Create `e2e/pages/history.page.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test'

export class HistoryPage {
  readonly page: Page
  
  // Header
  readonly pageTitle: Locator
  readonly backButton: Locator
  
  // Filter controls
  readonly filterBar: Locator
  readonly modeFilterAll: Locator
  readonly modeFilterStopwatch: Locator
  readonly modeFilterCountdown: Locator
  readonly modeFilterIntervals: Locator
  readonly dateRangePicker: Locator
  readonly clearFiltersButton: Locator
  readonly searchInput: Locator
  
  // Session list
  readonly sessionList: Locator
  readonly sessionCards: Locator
  readonly emptyState: Locator
  
  // Sidebar buttons
  readonly exportButton: Locator
  readonly settingsButton: Locator
  readonly archiveButton: Locator
  
  // Modals
  readonly sessionDetailsModal: Locator
  readonly exportModal: Locator
  readonly clearHistoryModal: Locator

  constructor(page: Page) {
    this.page = page
    
    // Header
    this.pageTitle = page.getByRole('heading', { name: /history|sessions/i })
    this.backButton = page.getByRole('button', { name: /back|go back/i })
    
    // Filter controls
    this.filterBar = page.locator('[data-testid="filter-bar"]')
    this.modeFilterAll = page.getByRole('button', { name: /^all$/i })
    this.modeFilterStopwatch = page.getByRole('button', { name: /stopwatch/i })
    this.modeFilterCountdown = page.getByRole('button', { name: /countdown/i })
    this.modeFilterIntervals = page.getByRole('button', { name: /intervals/i })
    this.dateRangePicker = page.locator('[data-testid="date-range-picker"]')
    this.clearFiltersButton = page.getByRole('button', { name: /clear filters/i })
    this.searchInput = page.getByPlaceholder(/search/i)
    
    // Session list
    this.sessionList = page.locator('[data-testid="session-list"]')
    this.sessionCards = page.locator('[data-testid="session-card"]')
    this.emptyState = page.locator('[data-testid="empty-state"]')
    
    // Sidebar buttons
    this.exportButton = page.getByRole('button', { name: /export/i })
    this.settingsButton = page.getByRole('button', { name: /settings/i })
    this.archiveButton = page.getByRole('button', { name: /archive/i })
    
    // Modals
    this.sessionDetailsModal = page.locator('[data-testid="session-details-modal"]')
    this.exportModal = page.locator('[data-testid="export-modal"]')
    this.clearHistoryModal = page.locator('[data-testid="clear-history-modal"]')
  }

  async goto() {
    await this.page.goto('/timer/premium-history')
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    // Wait for either sessions or empty state
    await this.page.waitForSelector('[data-testid="session-list"], [data-testid="empty-state"], .session-card, text=/no sessions/i', { timeout: 10000 })
  }

  // Navigation
  async goBack() {
    await this.backButton.click()
  }

  // Filtering
  async filterByMode(mode: 'All' | 'Stopwatch' | 'Countdown' | 'Intervals') {
    switch (mode) {
      case 'All':
        await this.modeFilterAll.click()
        break
      case 'Stopwatch':
        await this.modeFilterStopwatch.click()
        break
      case 'Countdown':
        await this.modeFilterCountdown.click()
        break
      case 'Intervals':
        await this.modeFilterIntervals.click()
        break
    }
    await this.page.waitForTimeout(300) // Filter animation
  }

  async setDateRange(start: Date, end: Date) {
    await this.dateRangePicker.click()
    // Date picker interaction - depends on implementation
    // This is a simplified version
    await this.page.fill('[data-testid="start-date"]', start.toISOString().split('T')[0])
    await this.page.fill('[data-testid="end-date"]', end.toISOString().split('T')[0])
    await this.page.getByRole('button', { name: /apply/i }).click()
  }

  async clearFilters() {
    await this.clearFiltersButton.click()
    await this.page.waitForTimeout(200)
  }

  async searchSessions(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(300) // Debounce
  }

  // Session interactions
  async getSessionCount(): Promise<number> {
    return await this.sessionCards.count()
  }

  async clickSession(index: number) {
    await this.sessionCards.nth(index).click()
    await this.page.waitForTimeout(200)
  }

  async getSessionDetails(index: number): Promise<{ mode: string; duration: string }> {
    const card = this.sessionCards.nth(index)
    const modeText = await card.locator('[data-testid="session-mode"]').textContent()
    const durationText = await card.locator('[data-testid="session-duration"]').textContent()
    return {
      mode: modeText?.trim() || '',
      duration: durationText?.trim() || ''
    }
  }

  // Export
  async openExportModal() {
    await this.exportButton.click()
    await this.exportModal.waitFor({ state: 'visible' })
  }

  async exportAs(format: 'csv' | 'json' | 'pdf') {
    await this.openExportModal()
    await this.page.getByRole('button', { name: new RegExp(format, 'i') }).click()
  }

  // Clear history
  async clearAllHistory() {
    await this.page.getByRole('button', { name: /clear|delete all/i }).click()
    await this.clearHistoryModal.waitFor({ state: 'visible' })
    await this.page.getByRole('button', { name: /confirm|yes/i }).click()
  }

  // Assertions helpers
  async expectSessionCount(count: number) {
    await expect(this.sessionCards).toHaveCount(count)
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible()
  }
}
```
</action>
<verify>
```bash
ls -la e2e/pages/history.page.ts
```
</verify>
<done>History page object model created with filtering, session interactions, export, and clear history functionality</done>
</task>

<task type="auto">
<name>Create Goals and Achievements page object models</name>
<files>e2e/pages/goals.page.ts, e2e/pages/achievements.page.ts, e2e/pages/index.ts</files>
<action>
1. Create `e2e/pages/goals.page.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test'

export class GoalsPage {
  readonly page: Page
  
  // Header
  readonly pageTitle: Locator
  readonly backButton: Locator
  
  // Goal creation
  readonly createGoalButton: Locator
  readonly goalNameInput: Locator
  readonly goalTypeSelect: Locator
  readonly goalTargetInput: Locator
  readonly goalPeriodSelect: Locator
  readonly saveGoalButton: Locator
  
  // Goal list
  readonly goalsList: Locator
  readonly goalCards: Locator
  readonly emptyState: Locator
  
  // Goal card actions
  readonly completeGoalButton: Locator
  readonly pauseGoalButton: Locator
  readonly deleteGoalButton: Locator

  constructor(page: Page) {
    this.page = page
    
    this.pageTitle = page.getByRole('heading', { name: /goal/i })
    this.backButton = page.getByRole('button', { name: /back|go back/i })
    
    this.createGoalButton = page.getByRole('button', { name: /create|add|new goal/i })
    this.goalNameInput = page.getByPlaceholder(/goal name|name/i)
    this.goalTypeSelect = page.locator('[data-testid="goal-type"]')
    this.goalTargetInput = page.getByPlaceholder(/target/i)
    this.goalPeriodSelect = page.locator('[data-testid="goal-period"]')
    this.saveGoalButton = page.getByRole('button', { name: /save|create/i })
    
    this.goalsList = page.locator('[data-testid="goals-list"]')
    this.goalCards = page.locator('[data-testid="goal-card"]')
    this.emptyState = page.locator('[data-testid="empty-state"]')
    
    this.completeGoalButton = page.getByRole('button', { name: /complete/i })
    this.pauseGoalButton = page.getByRole('button', { name: /pause/i })
    this.deleteGoalButton = page.getByRole('button', { name: /delete/i })
  }

  async goto() {
    await this.page.goto('/timer/goals')
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    await this.pageTitle.waitFor({ state: 'visible' })
  }

  async goBack() {
    await this.backButton.click()
  }

  async createGoal(name: string, type: string, target: number, period: string) {
    await this.createGoalButton.click()
    await this.goalNameInput.fill(name)
    await this.goalTypeSelect.selectOption(type)
    await this.goalTargetInput.fill(target.toString())
    await this.goalPeriodSelect.selectOption(period)
    await this.saveGoalButton.click()
    await this.page.waitForTimeout(300)
  }

  async getGoalCount(): Promise<number> {
    return await this.goalCards.count()
  }

  async completeGoal(index: number) {
    await this.goalCards.nth(index).locator('[data-testid="complete-goal"]').click()
  }

  async deleteGoal(index: number) {
    await this.goalCards.nth(index).locator('[data-testid="delete-goal"]').click()
    await this.page.getByRole('button', { name: /confirm|yes/i }).click()
  }

  async expectGoalCount(count: number) {
    await expect(this.goalCards).toHaveCount(count)
  }
}
```

2. Create `e2e/pages/achievements.page.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test'

export class AchievementsPage {
  readonly page: Page
  
  // Header
  readonly pageTitle: Locator
  readonly backButton: Locator
  
  // Achievement display
  readonly achievementsList: Locator
  readonly achievementCards: Locator
  readonly unlockedBadges: Locator
  readonly lockedBadges: Locator
  
  // Categories/filters
  readonly categoryFilter: Locator
  readonly rarityFilter: Locator
  
  // Progress
  readonly progressBar: Locator
  readonly totalUnlocked: Locator

  constructor(page: Page) {
    this.page = page
    
    this.pageTitle = page.getByRole('heading', { name: /achievement/i })
    this.backButton = page.getByRole('button', { name: /back|go back/i })
    
    this.achievementsList = page.locator('[data-testid="achievements-list"]')
    this.achievementCards = page.locator('[data-testid="achievement-card"]')
    this.unlockedBadges = page.locator('[data-testid="achievement-card"][data-unlocked="true"]')
    this.lockedBadges = page.locator('[data-testid="achievement-card"][data-unlocked="false"]')
    
    this.categoryFilter = page.locator('[data-testid="category-filter"]')
    this.rarityFilter = page.locator('[data-testid="rarity-filter"]')
    
    this.progressBar = page.locator('[data-testid="achievements-progress"]')
    this.totalUnlocked = page.locator('[data-testid="total-unlocked"]')
  }

  async goto() {
    await this.page.goto('/timer/achievements')
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    await this.pageTitle.waitFor({ state: 'visible' })
  }

  async goBack() {
    await this.backButton.click()
  }

  async getUnlockedCount(): Promise<number> {
    return await this.unlockedBadges.count()
  }

  async getLockedCount(): Promise<number> {
    return await this.lockedBadges.count()
  }

  async getTotalCount(): Promise<number> {
    return await this.achievementCards.count()
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption(category)
    await this.page.waitForTimeout(200)
  }

  async filterByRarity(rarity: string) {
    await this.rarityFilter.selectOption(rarity)
    await this.page.waitForTimeout(200)
  }

  async clickAchievement(index: number) {
    await this.achievementCards.nth(index).click()
  }

  async expectUnlockedCount(count: number) {
    await expect(this.unlockedBadges).toHaveCount(count)
  }
}
```

3. Create `e2e/pages/index.ts`:

```typescript
export { TimerPage } from './timer.page'
export { HistoryPage } from './history.page'
export { GoalsPage } from './goals.page'
export { AchievementsPage } from './achievements.page'
```
</action>
<verify>
```bash
ls -la e2e/pages/
```
</verify>
<done>Goals and Achievements page object models created, all POMs exported from index.ts</done>
</task>

## Success Criteria
- TimerPage POM covers all 3 timer modes with controls
- HistoryPage POM covers filtering, session interactions, export
- GoalsPage POM covers goal CRUD operations
- AchievementsPage POM covers achievement display and filtering
- All POMs exported from e2e/pages/index.ts

## Verification
```bash
ls -la e2e/pages/
cat e2e/pages/index.ts
```
