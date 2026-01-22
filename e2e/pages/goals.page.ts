/**
 * GoalsPage Page Object Model
 * Encapsulates interactions with the Goals page/modal
 * Routes: /timer/goals (or accessed via modal)
 */

import { Page, Locator } from '@playwright/test';

export type GoalFilter = 'all' | 'active' | 'completed';

export interface GoalInfo {
  name: string;
  target: string;
  progress: number;
  status: string;
}

export class GoalsPage {
  readonly page: Page;

  // Main container (modal or page)
  readonly goalsModal: Locator;
  readonly goalsContainer: Locator;

  // Header
  readonly header: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;

  // Stats
  readonly totalGoalsCount: Locator;
  readonly activeGoalsCount: Locator;
  readonly completedGoalsCount: Locator;

  // Filter tabs
  readonly filterTabs: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  // Goal list
  readonly goalCards: Locator;
  readonly emptyState: Locator;
  readonly createFirstGoalButton: Locator;

  // Create goal button (footer)
  readonly createGoalButton: Locator;

  // Create goal modal
  readonly createGoalModal: Locator;
  readonly goalNameInput: Locator;
  readonly goalTargetInput: Locator;
  readonly goalTypeSelect: Locator;
  readonly goalPeriodSelect: Locator;
  readonly saveGoalButton: Locator;
  readonly cancelButton: Locator;

  // Goal card actions
  readonly goalDeleteButton: Locator;
  readonly goalPauseButton: Locator;
  readonly goalResumeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container - could be modal or full page
    this.goalsModal = page.getByRole('dialog', { name: /goals|goal tracker/i });
    this.goalsContainer = this.goalsModal.or(page.locator('[class*="Goals"]'));

    // Header
    this.header = this.goalsContainer.locator('[class*="Header"]').first();
    this.title = page.getByRole('heading', { name: /goal tracker/i });
    this.closeButton = this.goalsContainer.getByRole('button', { name: /close/i });

    // Stats - based on GoalsModal structure
    this.totalGoalsCount = this.goalsContainer.locator('text=/Total Goals/i').locator('xpath=preceding-sibling::div').first();
    this.activeGoalsCount = this.goalsContainer.locator('text=/^Active$/i').locator('xpath=preceding-sibling::div').first();
    this.completedGoalsCount = this.goalsContainer.locator('text=/^Completed$/i').locator('xpath=preceding-sibling::div').first();

    // Filter tabs
    this.filterTabs = this.goalsContainer.locator('[class*="filter"]');
    this.filterAll = this.goalsContainer.getByRole('button', { name: /^all$/i });
    this.filterActive = this.goalsContainer.getByRole('button', { name: /^active$/i });
    this.filterCompleted = this.goalsContainer.getByRole('button', { name: /^completed$/i });

    // Goal list
    this.goalCards = this.goalsContainer.locator('[class*="GoalCard"]');
    this.emptyState = this.goalsContainer.locator('text=/no.*goals/i');
    this.createFirstGoalButton = this.goalsContainer.getByRole('button', { name: /create.*first.*goal/i });

    // Create goal button
    this.createGoalButton = this.goalsContainer.getByRole('button', { name: /create.*goal/i }).last();

    // Create goal modal
    this.createGoalModal = page.getByRole('dialog').filter({ hasText: /create.*goal|new.*goal/i });
    this.goalNameInput = this.createGoalModal.getByRole('textbox', { name: /name|title/i }).or(
      this.createGoalModal.getByPlaceholder(/name|title/i)
    );
    this.goalTargetInput = this.createGoalModal.getByRole('spinbutton', { name: /target|hours|minutes/i }).or(
      this.createGoalModal.getByPlaceholder(/target|hours/i)
    );
    this.goalTypeSelect = this.createGoalModal.getByRole('combobox', { name: /type/i }).or(
      this.createGoalModal.locator('select').first()
    );
    this.goalPeriodSelect = this.createGoalModal.getByRole('combobox', { name: /period|frequency/i }).or(
      this.createGoalModal.locator('select').last()
    );
    this.saveGoalButton = this.createGoalModal.getByRole('button', { name: /save|create|add/i });
    this.cancelButton = this.createGoalModal.getByRole('button', { name: /cancel/i });

    // Goal card actions - these are relative and need to be called per card
    this.goalDeleteButton = page.getByRole('button', { name: /delete/i });
    this.goalPauseButton = page.getByRole('button', { name: /pause/i });
    this.goalResumeButton = page.getByRole('button', { name: /resume/i });
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/timer/goals');
    await this.page.waitForLoadState('networkidle');
  }

  // For accessing via modal
  async waitForModalOpen(): Promise<void> {
    await this.goalsModal.waitFor({ state: 'visible' });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  // Filtering
  async filterBy(filter: GoalFilter): Promise<void> {
    const filterButton = {
      all: this.filterAll,
      active: this.filterActive,
      completed: this.filterCompleted,
    }[filter];

    await filterButton.click();
    await this.page.waitForTimeout(300);
  }

  // Create goal
  async openCreateGoalModal(): Promise<void> {
    // Try the main create button first, then the empty state button
    const mainButton = await this.createGoalButton.isVisible();
    if (mainButton) {
      await this.createGoalButton.click();
    } else {
      await this.createFirstGoalButton.click();
    }
    await this.createGoalModal.waitFor({ state: 'visible' });
  }

  async createGoal(name: string, target: number, type?: string, period?: string): Promise<void> {
    await this.openCreateGoalModal();
    
    await this.goalNameInput.fill(name);
    await this.goalTargetInput.fill(target.toString());
    
    if (type) {
      await this.goalTypeSelect.selectOption(type);
    }
    
    if (period) {
      await this.goalPeriodSelect.selectOption(period);
    }
    
    await this.saveGoalButton.click();
    await this.createGoalModal.waitFor({ state: 'hidden' });
  }

  async cancelCreateGoal(): Promise<void> {
    await this.cancelButton.click();
    await this.createGoalModal.waitFor({ state: 'hidden' });
  }

  // Getters
  async getGoalCount(): Promise<number> {
    return await this.goalCards.count();
  }

  async getGoalAt(index: number): Promise<GoalInfo> {
    const card = this.goalCards.nth(index);
    
    const name = await card.locator('[class*="name"], [class*="title"]').textContent() || '';
    const target = await card.locator('[class*="target"]').textContent() || '';
    const progressText = await card.locator('[class*="progress"]').textContent() || '0';
    const status = await card.locator('[class*="status"]').textContent() || '';

    // Extract progress percentage from text
    const progressMatch = progressText.match(/(\d+)/);
    const progress = progressMatch ? parseInt(progressMatch[1]) : 0;

    return {
      name: name.trim(),
      target: target.trim(),
      progress,
      status: status.trim(),
    };
  }

  async getGoalProgress(index: number): Promise<number> {
    const goalInfo = await this.getGoalAt(index);
    return goalInfo.progress;
  }

  async isEmpty(): Promise<boolean> {
    const count = await this.getGoalCount();
    return count === 0;
  }

  // Stats getters
  async getTotalGoalsCount(): Promise<number> {
    const text = await this.totalGoalsCount.textContent();
    return parseInt(text || '0');
  }

  async getActiveGoalsCount(): Promise<number> {
    const text = await this.activeGoalsCount.textContent();
    return parseInt(text || '0');
  }

  async getCompletedGoalsCount(): Promise<number> {
    const text = await this.completedGoalsCount.textContent();
    return parseInt(text || '0');
  }

  // Goal actions
  async deleteGoal(index: number): Promise<void> {
    const card = this.goalCards.nth(index);
    const deleteButton = card.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Handle confirmation if present
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i });
    const isVisible = await confirmButton.isVisible().catch(() => false);
    if (isVisible) {
      await confirmButton.click();
    }
  }

  async pauseGoal(index: number): Promise<void> {
    const card = this.goalCards.nth(index);
    const pauseButton = card.getByRole('button', { name: /pause/i });
    await pauseButton.click();
  }

  async resumeGoal(index: number): Promise<void> {
    const card = this.goalCards.nth(index);
    const resumeButton = card.getByRole('button', { name: /resume/i });
    await resumeButton.click();
  }

  // Wait helpers
  async waitForGoalsToLoad(): Promise<void> {
    await Promise.race([
      this.goalCards.first().waitFor({ state: 'visible' }),
      this.emptyState.waitFor({ state: 'visible' }),
    ]).catch(() => {});
  }
}
