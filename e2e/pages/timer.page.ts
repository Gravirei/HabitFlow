/**
 * TimerPage Page Object Model
 * Encapsulates interactions with the main Timer page
 * Routes: /timer
 */

import { Page, Locator, expect } from '@playwright/test';

export type TimerMode = 'stopwatch' | 'countdown' | 'intervals';

export class TimerPage {
  readonly page: Page;

  // Mode selectors (tabs)
  readonly stopwatchTab: Locator;
  readonly countdownTab: Locator;
  readonly intervalsTab: Locator;
  readonly modeTabList: Locator;

  // Timer controls
  readonly startButton: Locator;
  readonly pauseButton: Locator;
  readonly continueButton: Locator;
  readonly killButton: Locator;
  readonly lapButton: Locator;

  // Kill confirmation modal
  readonly killConfirmModal: Locator;
  readonly killSaveButton: Locator;
  readonly killDiscardButton: Locator;

  // Timer display
  readonly timerDisplay: Locator;
  readonly timerPanel: Locator;

  // Countdown specific - Wheel pickers
  readonly hoursPicker: Locator;
  readonly minutesPicker: Locator;
  readonly secondsPicker: Locator;
  readonly presetButtons: Locator;

  // Intervals specific
  readonly workMinutesPicker: Locator;
  readonly breakMinutesPicker: Locator;
  readonly intervalsProgressBar: Locator;
  readonly currentIntervalLabel: Locator;
  readonly loopCounter: Locator;
  readonly quickPresetsButton: Locator;
  readonly intervalPresets: Locator;
  readonly sessionSetupModal: Locator;
  readonly sessionNameInput: Locator;
  readonly sessionLoopsInput: Locator;
  readonly sessionSetupConfirm: Locator;

  // Completion modal
  readonly completionModal: Locator;
  readonly completionConfirmButton: Locator;

  // Resume modal
  readonly resumeModal: Locator;
  readonly resumeButton: Locator;
  readonly discardButton: Locator;

  // Top navigation
  readonly backButton: Locator;
  readonly menuButton: Locator;
  readonly settingsButton: Locator;
  readonly historyButton: Locator;
  readonly notificationsToggle: Locator;
  readonly soundToggle: Locator;
  readonly vibrationToggle: Locator;

  // Settings modal
  readonly settingsModal: Locator;
  readonly settingsCloseButton: Locator;

  // History modal
  readonly historyModal: Locator;
  readonly historyCloseButton: Locator;

  // Menu sidebar
  readonly menuSidebar: Locator;

  // Laps display (Stopwatch)
  readonly lapsContainer: Locator;
  readonly lapItems: Locator;

  constructor(page: Page) {
    this.page = page;

    // Mode tabs
    this.modeTabList = page.getByRole('tablist', { name: 'Timer modes' });
    this.stopwatchTab = page.getByRole('tab', { name: /stopwatch/i });
    this.countdownTab = page.getByRole('tab', { name: /countdown/i });
    this.intervalsTab = page.getByRole('tab', { name: /intervals/i });

    // Timer controls - using aria-labels from AnimatedTimerButton
    this.startButton = page.getByRole('button', { name: /start.*timer/i });
    this.pauseButton = page.getByRole('button', { name: /pause/i });
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.killButton = page.getByRole('button', { name: /stop.*timer|kill/i });
    this.lapButton = page.getByRole('button', { name: /record lap|lap/i });

    // Kill confirmation modal
    this.killConfirmModal = page.getByRole('alertdialog');
    this.killSaveButton = page.getByRole('button', { name: /yes.*save/i });
    this.killDiscardButton = page.getByRole('button', { name: /^no$/i });

    // Timer display - the main time display area
    this.timerDisplay = page.locator('[class*="timer"]').filter({ hasText: /\d{2}:\d{2}/ }).first();
    this.timerPanel = page.getByRole('tabpanel');

    // Countdown wheel pickers - using labels
    this.hoursPicker = page.locator('[class*="WheelPicker"]').filter({ hasText: 'HRS' });
    this.minutesPicker = page.locator('[class*="WheelPicker"]').filter({ hasText: 'MIN' }).first();
    this.secondsPicker = page.locator('[class*="WheelPicker"]').filter({ hasText: 'SEC' });
    this.presetButtons = page.locator('[class*="TimerPresets"] button');

    // Intervals specific
    this.workMinutesPicker = page.locator('[class*="WheelPicker"]').first();
    this.breakMinutesPicker = page.locator('[class*="WheelPicker"]').last();
    this.intervalsProgressBar = page.getByRole('progressbar', { name: /progress/i });
    this.currentIntervalLabel = page.locator('text=/Focus Time|Break Time/');
    this.loopCounter = page.locator('text=/Loop \\d+ of \\d+|Session \\d+/');
    this.quickPresetsButton = page.getByRole('button', { name: /quick presets/i });
    this.intervalPresets = page.locator('[class*="IntervalPresets"] button');
    this.sessionSetupModal = page.getByRole('dialog').filter({ hasText: /session/i });
    this.sessionNameInput = page.getByRole('textbox', { name: /name|session/i });
    this.sessionLoopsInput = page.getByRole('spinbutton', { name: /loops|count/i });
    this.sessionSetupConfirm = page.getByRole('button', { name: /start|confirm/i });

    // Completion modal
    this.completionModal = page.getByRole('dialog').filter({ hasText: /complete|finished/i });
    this.completionConfirmButton = this.completionModal.getByRole('button', { name: /ok|done|confirm/i });

    // Resume modal
    this.resumeModal = page.getByRole('dialog').filter({ hasText: /resume/i });
    this.resumeButton = this.resumeModal.getByRole('button', { name: /resume/i });
    this.discardButton = this.resumeModal.getByRole('button', { name: /discard/i });

    // Top navigation
    this.backButton = page.getByRole('button', { name: /go back/i });
    this.menuButton = page.getByRole('button', { name: /open menu/i });
    this.settingsButton = page.getByRole('button', { name: /settings/i });
    this.historyButton = page.getByRole('button', { name: /history/i });
    this.notificationsToggle = page.getByRole('button', { name: /notifications/i });
    this.soundToggle = page.getByRole('button', { name: /sound/i });
    this.vibrationToggle = page.getByRole('button', { name: /vibration/i });

    // Settings modal
    this.settingsModal = page.getByRole('dialog').filter({ hasText: /settings/i });
    this.settingsCloseButton = this.settingsModal.getByRole('button', { name: /close/i });

    // History modal
    this.historyModal = page.getByRole('dialog').filter({ hasText: /history/i });
    this.historyCloseButton = this.historyModal.getByRole('button', { name: /close/i });

    // Menu sidebar
    this.menuSidebar = page.locator('[class*="Sidebar"]').filter({ has: page.getByRole('navigation') });

    // Laps display
    this.lapsContainer = page.getByRole('region', { name: /lap times/i });
    this.lapItems = this.lapsContainer.getByRole('listitem');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/timer');
    await this.page.waitForLoadState('networkidle');
  }

  async selectMode(mode: TimerMode): Promise<void> {
    const tab = {
      stopwatch: this.stopwatchTab,
      countdown: this.countdownTab,
      intervals: this.intervalsTab,
    }[mode];

    await tab.click();
    // Wait for mode transition animation
    await this.page.waitForTimeout(300);
  }

  // Timer actions
  async start(): Promise<void> {
    await this.startButton.click();
  }

  async pause(): Promise<void> {
    await this.pauseButton.click();
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async stop(saveToHistory: boolean = true): Promise<void> {
    await this.killButton.click();
    await this.killConfirmModal.waitFor({ state: 'visible' });

    if (saveToHistory) {
      await this.killSaveButton.click();
    } else {
      await this.killDiscardButton.click();
    }
  }

  async reset(): Promise<void> {
    // Reset is achieved by stopping without saving
    await this.stop(false);
  }

  async addLap(): Promise<void> {
    await this.lapButton.click();
  }

  // Countdown actions
  async setCountdownTime(minutes: number, seconds: number = 0, hours: number = 0): Promise<void> {
    // Note: Wheel pickers require scroll/swipe interactions
    // For E2E tests, we may need to use presets or direct value setting
    // This is a simplified implementation - actual implementation may need adjustment
    // based on how WheelPicker accepts input

    if (hours > 0) {
      await this.hoursPicker.click();
      // Wheel picker interaction would go here
    }

    if (minutes > 0) {
      await this.minutesPicker.click();
      // Wheel picker interaction would go here
    }

    if (seconds > 0) {
      await this.secondsPicker.click();
      // Wheel picker interaction would go here
    }
  }

  async selectPreset(index: number): Promise<void> {
    const preset = this.presetButtons.nth(index);
    await preset.click();
  }

  async selectPresetByLabel(label: string): Promise<void> {
    const preset = this.presetButtons.filter({ hasText: label });
    await preset.click();
  }

  // Intervals actions
  async configureIntervals(workMinutes: number, breakMinutes: number): Promise<void> {
    // Similar to countdown, wheel pickers need special handling
    // This is a placeholder for the actual implementation
    await this.workMinutesPicker.click();
    await this.breakMinutesPicker.click();
  }

  async openQuickPresets(): Promise<void> {
    await this.quickPresetsButton.click();
  }

  async selectIntervalPreset(index: number): Promise<void> {
    await this.openQuickPresets();
    const preset = this.intervalPresets.nth(index);
    await preset.click();
  }

  async startIntervalsSession(name: string, loops: number): Promise<void> {
    await this.startButton.click();

    // If session setup modal appears (for custom intervals)
    const modalVisible = await this.sessionSetupModal.isVisible().catch(() => false);
    if (modalVisible) {
      await this.sessionNameInput.fill(name);
      await this.sessionLoopsInput.fill(loops.toString());
      await this.sessionSetupConfirm.click();
    }
  }

  // Getters
  async getDisplayedTime(): Promise<string> {
    const text = await this.timerDisplay.textContent();
    return text?.trim() || '';
  }

  async getCurrentMode(): Promise<TimerMode> {
    if (await this.stopwatchTab.getAttribute('aria-selected') === 'true') {
      return 'stopwatch';
    }
    if (await this.countdownTab.getAttribute('aria-selected') === 'true') {
      return 'countdown';
    }
    if (await this.intervalsTab.getAttribute('aria-selected') === 'true') {
      return 'intervals';
    }
    return 'stopwatch'; // default
  }

  async isRunning(): Promise<boolean> {
    // Timer is running if pause button is visible
    return await this.pauseButton.isVisible();
  }

  async isPaused(): Promise<boolean> {
    // Timer is paused if continue button is visible
    return await this.continueButton.isVisible();
  }

  async isIdle(): Promise<boolean> {
    // Timer is idle if start button is visible
    return await this.startButton.isVisible();
  }

  async isCompletionModalVisible(): Promise<boolean> {
    return await this.completionModal.isVisible();
  }

  async dismissCompletionModal(): Promise<void> {
    await this.completionConfirmButton.click();
  }

  async getLapCount(): Promise<number> {
    const isVisible = await this.lapsContainer.isVisible();
    if (!isVisible) return 0;
    return await this.lapItems.count();
  }

  async getLapTime(index: number): Promise<string> {
    const lapItem = this.lapItems.nth(index);
    const text = await lapItem.textContent();
    return text?.trim() || '';
  }

  // Resume modal actions
  async isResumeModalVisible(): Promise<boolean> {
    return await this.resumeModal.isVisible();
  }

  async resumeTimer(): Promise<void> {
    await this.resumeButton.click();
  }

  async discardSavedTimer(): Promise<void> {
    await this.discardButton.click();
  }

  // Settings
  async openSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.settingsModal.waitFor({ state: 'visible' });
  }

  async closeSettings(): Promise<void> {
    await this.settingsCloseButton.click();
  }

  // History
  async openHistory(): Promise<void> {
    await this.historyButton.click();
    await this.historyModal.waitFor({ state: 'visible' });
  }

  async closeHistory(): Promise<void> {
    await this.historyCloseButton.click();
  }

  // Menu
  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  // Navigation
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // Intervals specific getters
  async getCurrentInterval(): Promise<'work' | 'break' | null> {
    const text = await this.currentIntervalLabel.textContent();
    if (text?.includes('Focus')) return 'work';
    if (text?.includes('Break')) return 'break';
    return null;
  }

  async getCurrentLoopInfo(): Promise<{ current: number; total: number } | null> {
    const text = await this.loopCounter.textContent();
    const match = text?.match(/Loop (\d+) of (\d+)/);
    if (match) {
      return { current: parseInt(match[1]), total: parseInt(match[2]) };
    }
    return null;
  }

  // Wait helpers
  async waitForTimerToStart(): Promise<void> {
    await this.pauseButton.waitFor({ state: 'visible' });
  }

  async waitForTimerToComplete(): Promise<void> {
    await this.completionModal.waitFor({ state: 'visible' });
  }

  async waitForModeTransition(): Promise<void> {
    // Wait for framer-motion animation to complete
    await this.page.waitForTimeout(800);
  }
}
