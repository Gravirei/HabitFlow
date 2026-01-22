/**
 * HistoryPage Page Object Model
 * Encapsulates interactions with the Premium History page
 * Routes: /timer/premium-history
 */

import { Page, Locator } from '@playwright/test';

export type HistoryModeFilter = 'all' | 'stopwatch' | 'countdown' | 'intervals';

export interface SessionInfo {
  duration: string;
  mode: string;
  date: string;
}

export class HistoryPage {
  readonly page: Page;

  // Layout
  readonly header: Locator;
  readonly mainContent: Locator;

  // Filters
  readonly modeFilter: Locator;
  readonly modeFilterAll: Locator;
  readonly modeFilterStopwatch: Locator;
  readonly modeFilterCountdown: Locator;
  readonly modeFilterIntervals: Locator;
  readonly dateRangePicker: Locator;
  readonly clearFiltersButton: Locator;
  readonly searchInput: Locator;
  readonly filterSettingsButton: Locator;

  // Session list
  readonly sessionCards: Locator;
  readonly sessionList: Locator;
  readonly emptyState: Locator;
  readonly loadingSpinner: Locator;

  // Session card elements (accessed via sessionCards)
  readonly sessionDuration: Locator;
  readonly sessionMode: Locator;
  readonly sessionDate: Locator;

  // Actions
  readonly exportButton: Locator;
  readonly clearHistoryButton: Locator;
  readonly settingsButton: Locator;

  // Modals
  readonly exportModal: Locator;
  readonly exportCsvButton: Locator;
  readonly exportJsonButton: Locator;
  readonly exportCloseButton: Locator;

  readonly clearHistoryModal: Locator;
  readonly clearHistoryConfirmButton: Locator;
  readonly clearHistoryCancelButton: Locator;

  readonly sessionDetailsModal: Locator;
  readonly sessionDetailsCloseButton: Locator;

  // Settings sidebar
  readonly settingsSidebar: Locator;
  readonly settingsCloseButton: Locator;

  // Navigation
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Layout
    this.header = page.locator('[class*="Header"]').first();
    this.mainContent = page.getByRole('main');

    // Filters
    this.modeFilter = page.locator('[class*="ModeFilter"], [class*="FilterBar"]');
    this.modeFilterAll = page.getByRole('button', { name: /^all$/i });
    this.modeFilterStopwatch = page.getByRole('button', { name: /stopwatch/i });
    this.modeFilterCountdown = page.getByRole('button', { name: /countdown/i });
    this.modeFilterIntervals = page.getByRole('button', { name: /intervals/i });
    this.dateRangePicker = page.locator('[class*="DateRangePicker"]');
    this.clearFiltersButton = page.getByRole('button', { name: /clear.*filter/i });
    this.searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    this.filterSettingsButton = page.getByRole('button', { name: /filter.*settings/i });

    // Session list
    this.sessionCards = page.locator('[class*="SessionCard"], [class*="Card"]').filter({
      has: page.locator('[class*="duration"], [class*="time"]'),
    });
    this.sessionList = page.locator('[class*="SessionList"], [class*="VirtualizedList"]');
    this.emptyState = page.locator('[class*="EmptyState"]').or(
      page.locator('text=/no.*sessions|no.*history|empty/i')
    );
    this.loadingSpinner = page.locator('[class*="loading"], [class*="spinner"]');

    // Session card elements - these are relative selectors
    this.sessionDuration = page.locator('[class*="duration"]');
    this.sessionMode = page.locator('[class*="mode"]');
    this.sessionDate = page.locator('[class*="date"]');

    // Actions
    this.exportButton = page.getByRole('button', { name: /export/i });
    this.clearHistoryButton = page.getByRole('button', { name: /clear.*history/i });
    this.settingsButton = page.getByRole('button', { name: /settings/i });

    // Export modal
    this.exportModal = page.getByRole('dialog').filter({ hasText: /export/i });
    this.exportCsvButton = this.exportModal.getByRole('button', { name: /csv/i });
    this.exportJsonButton = this.exportModal.getByRole('button', { name: /json/i });
    this.exportCloseButton = this.exportModal.getByRole('button', { name: /close/i });

    // Clear history modal
    this.clearHistoryModal = page.getByRole('dialog').filter({ hasText: /clear.*history/i });
    this.clearHistoryConfirmButton = this.clearHistoryModal.getByRole('button', { name: /confirm|yes|clear/i });
    this.clearHistoryCancelButton = this.clearHistoryModal.getByRole('button', { name: /cancel|no/i });

    // Session details modal
    this.sessionDetailsModal = page.getByRole('dialog').filter({ hasText: /details|session/i });
    this.sessionDetailsCloseButton = this.sessionDetailsModal.getByRole('button', { name: /close/i });

    // Settings sidebar
    this.settingsSidebar = page.locator('[class*="SettingsSidebar"]');
    this.settingsCloseButton = this.settingsSidebar.getByRole('button', { name: /close/i });

    // Navigation
    this.backButton = page.getByRole('button', { name: /back|go back/i });
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/timer/premium-history');
    await this.page.waitForLoadState('networkidle');
  }

  // Filtering
  async filterByMode(mode: HistoryModeFilter): Promise<void> {
    const filterButton = {
      all: this.modeFilterAll,
      stopwatch: this.modeFilterStopwatch,
      countdown: this.modeFilterCountdown,
      intervals: this.modeFilterIntervals,
    }[mode];

    await filterButton.click();
    // Wait for filter to apply
    await this.page.waitForTimeout(300);
  }

  async filterByDateRange(start: Date, end: Date): Promise<void> {
    await this.dateRangePicker.click();
    // Date picker interaction - implementation depends on the actual picker component
    // This is a placeholder for the actual implementation
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    // Would need to interact with the date picker modal here
    await this.page.waitForTimeout(300);
  }

  async clearFilters(): Promise<void> {
    const isVisible = await this.clearFiltersButton.isVisible();
    if (isVisible) {
      await this.clearFiltersButton.click();
    }
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    // Wait for search results
    await this.page.waitForTimeout(500);
  }

  // Getters
  async getSessionCount(): Promise<number> {
    await this.page.waitForTimeout(300); // Wait for any loading
    return await this.sessionCards.count();
  }

  async getSessionAt(index: number): Promise<SessionInfo> {
    const card = this.sessionCards.nth(index);
    
    const duration = await card.locator('[class*="duration"]').textContent() || '';
    const mode = await card.locator('[class*="mode"]').textContent() || '';
    const date = await card.locator('[class*="date"]').textContent() || '';

    return {
      duration: duration.trim(),
      mode: mode.trim(),
      date: date.trim(),
    };
  }

  async isEmpty(): Promise<boolean> {
    const sessionCount = await this.getSessionCount();
    if (sessionCount === 0) return true;
    
    return await this.emptyState.isVisible();
  }

  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  // Actions
  async exportSessions(format: 'csv' | 'json'): Promise<void> {
    await this.exportButton.click();
    await this.exportModal.waitFor({ state: 'visible' });

    if (format === 'csv') {
      await this.exportCsvButton.click();
    } else {
      await this.exportJsonButton.click();
    }
  }

  async closeExportModal(): Promise<void> {
    await this.exportCloseButton.click();
  }

  async clearHistory(): Promise<void> {
    await this.clearHistoryButton.click();
    await this.clearHistoryModal.waitFor({ state: 'visible' });
    await this.clearHistoryConfirmButton.click();
  }

  async cancelClearHistory(): Promise<void> {
    await this.clearHistoryCancelButton.click();
  }

  async openSession(index: number): Promise<void> {
    const card = this.sessionCards.nth(index);
    await card.click();
    await this.sessionDetailsModal.waitFor({ state: 'visible' });
  }

  async closeSessionDetails(): Promise<void> {
    await this.sessionDetailsCloseButton.click();
  }

  async deleteSession(index: number): Promise<void> {
    const card = this.sessionCards.nth(index);
    const deleteButton = card.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();
    
    // Confirm deletion if a confirmation dialog appears
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
    const isVisible = await confirmButton.isVisible().catch(() => false);
    if (isVisible) {
      await confirmButton.click();
    }
  }

  // Settings
  async openSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.settingsSidebar.waitFor({ state: 'visible' });
  }

  async closeSettings(): Promise<void> {
    await this.settingsCloseButton.click();
  }

  // Navigation
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // Wait helpers
  async waitForSessionsToLoad(): Promise<void> {
    // Wait for loading to finish
    await this.loadingSpinner.waitFor({ state: 'hidden' }).catch(() => {});
    // Wait for either sessions or empty state to be visible
    await Promise.race([
      this.sessionCards.first().waitFor({ state: 'visible' }),
      this.emptyState.waitFor({ state: 'visible' }),
    ]).catch(() => {});
  }
}
