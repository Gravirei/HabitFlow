/**
 * AchievementsPage Page Object Model
 * Encapsulates interactions with the Achievements page/modal
 * Routes: /timer/achievements (or accessed via modal)
 */

import { Page, Locator } from '@playwright/test';

export interface AchievementInfo {
  name: string;
  description: string;
  isUnlocked: boolean;
  progress?: number;
}

export class AchievementsPage {
  readonly page: Page;

  // Main container (modal or page)
  readonly achievementsModal: Locator;
  readonly achievementsContainer: Locator;

  // Header
  readonly header: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly closeButton: Locator;

  // Content
  readonly contentArea: Locator;
  readonly achievementsPanel: Locator;

  // Achievement cards
  readonly achievementCards: Locator;
  readonly unlockedBadges: Locator;
  readonly lockedBadges: Locator;

  // Progress indicators
  readonly progressBars: Locator;
  readonly overallProgress: Locator;

  // Category sections (if achievements are grouped)
  readonly categorySections: Locator;

  // Empty state
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container - could be modal or full page
    this.achievementsModal = page.getByRole('dialog', { name: /achievements/i });
    this.achievementsContainer = this.achievementsModal.or(page.locator('[class*="Achievements"]'));

    // Header - based on AchievementsModal structure
    this.header = this.achievementsContainer.locator('[class*="Header"]').first();
    this.title = page.getByRole('heading', { name: /achievements/i });
    this.subtitle = this.achievementsContainer.locator('text=/unlock.*badges|track.*milestones/i');
    this.closeButton = this.achievementsContainer.getByRole('button', { name: /close/i });

    // Content
    this.contentArea = this.achievementsContainer.locator('[class*="content"], [class*="Content"]');
    this.achievementsPanel = this.achievementsContainer.locator('[class*="AchievementsPanel"]');

    // Achievement cards - looking for card-like elements with achievement info
    this.achievementCards = this.achievementsContainer.locator('[class*="AchievementCard"], [class*="achievement-card"], [class*="Badge"]');
    
    // Unlocked vs locked badges - based on visual state
    this.unlockedBadges = this.achievementsContainer.locator('[class*="unlocked"], [data-unlocked="true"]').or(
      this.achievementCards.filter({ has: page.locator('[class*="unlocked"]') })
    );
    this.lockedBadges = this.achievementsContainer.locator('[class*="locked"], [data-unlocked="false"]').or(
      this.achievementCards.filter({ has: page.locator('[class*="locked"]') })
    );

    // Progress indicators
    this.progressBars = this.achievementsContainer.locator('[role="progressbar"], [class*="progress"]');
    this.overallProgress = this.achievementsContainer.locator('[class*="overall"], [class*="total"]').locator('[class*="progress"]');

    // Category sections
    this.categorySections = this.achievementsContainer.locator('[class*="category"], [class*="section"]');

    // Empty state
    this.emptyState = this.achievementsContainer.locator('text=/no.*achievements/i');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/timer/achievements');
    await this.page.waitForLoadState('networkidle');
  }

  // For accessing via modal
  async waitForModalOpen(): Promise<void> {
    await this.achievementsModal.waitFor({ state: 'visible' });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.achievementsModal.waitFor({ state: 'hidden' });
  }

  // Getters - Counts
  async getUnlockedCount(): Promise<number> {
    // Try to get count from unlocked badges locator
    const count = await this.unlockedBadges.count();
    if (count > 0) return count;

    // Fallback: count cards that appear unlocked (non-greyed out)
    const cards = await this.achievementCards.all();
    let unlockedCount = 0;
    for (const card of cards) {
      const isUnlocked = await this.isCardUnlocked(card);
      if (isUnlocked) unlockedCount++;
    }
    return unlockedCount;
  }

  async getLockedCount(): Promise<number> {
    const count = await this.lockedBadges.count();
    if (count > 0) return count;

    // Fallback: total - unlocked
    const total = await this.getTotalCount();
    const unlocked = await this.getUnlockedCount();
    return total - unlocked;
  }

  async getTotalCount(): Promise<number> {
    return await this.achievementCards.count();
  }

  // Helper to check if a card element is unlocked
  private async isCardUnlocked(card: Locator): Promise<boolean> {
    const classes = await card.getAttribute('class') || '';
    const dataUnlocked = await card.getAttribute('data-unlocked');
    
    // Check for unlocked class or data attribute
    if (classes.includes('unlocked') || dataUnlocked === 'true') {
      return true;
    }
    
    // Check for locked indicators
    if (classes.includes('locked') || dataUnlocked === 'false') {
      return false;
    }
    
    // Check opacity (locked badges are often greyed out)
    const opacity = await card.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.opacity);
    });
    
    return opacity >= 0.8;
  }

  // Get achievement info
  async getAchievementAt(index: number): Promise<AchievementInfo> {
    const card = this.achievementCards.nth(index);
    
    const name = await card.locator('[class*="name"], [class*="title"], h3, h4').first().textContent() || '';
    const description = await card.locator('[class*="description"], p').first().textContent() || '';
    const isUnlocked = await this.isCardUnlocked(card);
    
    // Try to get progress if available
    let progress: number | undefined;
    const progressBar = card.locator('[role="progressbar"]');
    if (await progressBar.isVisible()) {
      const progressValue = await progressBar.getAttribute('aria-valuenow');
      progress = progressValue ? parseInt(progressValue) : undefined;
    }

    return {
      name: name.trim(),
      description: description.trim(),
      isUnlocked,
      progress,
    };
  }

  async isAchievementUnlocked(name: string): Promise<boolean> {
    // Find achievement by name
    const card = this.achievementCards.filter({ hasText: name }).first();
    const isVisible = await card.isVisible();
    
    if (!isVisible) {
      throw new Error(`Achievement "${name}" not found`);
    }
    
    return await this.isCardUnlocked(card);
  }

  async getAchievementProgress(name: string): Promise<number | null> {
    const card = this.achievementCards.filter({ hasText: name }).first();
    const progressBar = card.locator('[role="progressbar"]');
    
    if (await progressBar.isVisible()) {
      const progressValue = await progressBar.getAttribute('aria-valuenow');
      return progressValue ? parseInt(progressValue) : null;
    }
    
    return null;
  }

  // Get all achievements
  async getAllAchievements(): Promise<AchievementInfo[]> {
    const count = await this.getTotalCount();
    const achievements: AchievementInfo[] = [];
    
    for (let i = 0; i < count; i++) {
      achievements.push(await this.getAchievementAt(i));
    }
    
    return achievements;
  }

  // Get achievements by status
  async getUnlockedAchievements(): Promise<AchievementInfo[]> {
    const all = await this.getAllAchievements();
    return all.filter(a => a.isUnlocked);
  }

  async getLockedAchievements(): Promise<AchievementInfo[]> {
    const all = await this.getAllAchievements();
    return all.filter(a => !a.isUnlocked);
  }

  // Progress
  async getOverallProgress(): Promise<number> {
    const unlocked = await this.getUnlockedCount();
    const total = await this.getTotalCount();
    
    if (total === 0) return 0;
    return Math.round((unlocked / total) * 100);
  }

  // Category navigation (if applicable)
  async getCategoryCount(): Promise<number> {
    return await this.categorySections.count();
  }

  async getCategoryNames(): Promise<string[]> {
    const sections = await this.categorySections.all();
    const names: string[] = [];
    
    for (const section of sections) {
      const name = await section.locator('h3, h4, [class*="title"]').first().textContent();
      if (name) names.push(name.trim());
    }
    
    return names;
  }

  // Wait helpers
  async waitForAchievementsToLoad(): Promise<void> {
    await Promise.race([
      this.achievementCards.first().waitFor({ state: 'visible' }),
      this.emptyState.waitFor({ state: 'visible' }),
    ]).catch(() => {});
  }

  // Check if empty
  async isEmpty(): Promise<boolean> {
    const count = await this.getTotalCount();
    return count === 0;
  }
}
