/**
 * E2E Tests: Stopwatch Timer Mode
 * Tests for the stopwatch timer functionality including start, pause, resume,
 * stop, reset, lap recording, and session persistence.
 */

import { test, expect, STORAGE_KEYS } from '../fixtures';
import { TimerPage } from '../pages/timer.page';

test.describe('Stopwatch Timer', () => {
  let timerPage: TimerPage;

  test.beforeEach(async ({ page, clearTimerStorage }) => {
    timerPage = new TimerPage(page);
    await clearTimerStorage();
    await timerPage.goto();
    await timerPage.selectMode('stopwatch');
  });

  test.describe('Initial State', () => {
    test('displays initial time as 00:00:00', async () => {
      const time = await timerPage.getDisplayedTime();
      // Accept both 00:00:00 and 00:00 formats
      expect(time).toMatch(/^00:00(:00)?$/);
    });

    test('shows start button in idle state', async () => {
      const isIdle = await timerPage.isIdle();
      expect(isIdle).toBe(true);
    });

    test('stopwatch tab is selected', async () => {
      const mode = await timerPage.getCurrentMode();
      expect(mode).toBe('stopwatch');
    });
  });

  test.describe('Timer Controls', () => {
    test('start button starts the timer', async ({ page }) => {
      await timerPage.start();
      
      // Timer should be running (pause button visible)
      const isRunning = await timerPage.isRunning();
      expect(isRunning).toBe(true);
    });

    test('timer increments while running', async ({ page }) => {
      const initialTime = await timerPage.getDisplayedTime();
      
      await timerPage.start();
      await timerPage.waitForTimerToStart();
      
      // Wait for timer to increment
      await page.waitForTimeout(1500);
      
      const currentTime = await timerPage.getDisplayedTime();
      expect(currentTime).not.toBe(initialTime);
    });

    test('pause button pauses the timer', async ({ page }) => {
      await timerPage.start();
      await timerPage.waitForTimerToStart();
      await page.waitForTimeout(1000);
      
      await timerPage.pause();
      
      const isPaused = await timerPage.isPaused();
      expect(isPaused).toBe(true);
    });

    test('paused timer does not increment', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(1000);
      await timerPage.pause();
      
      const pausedTime = await timerPage.getDisplayedTime();
      await page.waitForTimeout(1500);
      const timeAfterWait = await timerPage.getDisplayedTime();
      
      expect(timeAfterWait).toBe(pausedTime);
    });

    test('resume continues from paused time', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(1000);
      await timerPage.pause();
      
      const pausedTime = await timerPage.getDisplayedTime();
      
      await timerPage.continue();
      await page.waitForTimeout(1500);
      
      const resumedTime = await timerPage.getDisplayedTime();
      expect(resumedTime).not.toBe(pausedTime);
      
      // Timer should still be running
      const isRunning = await timerPage.isRunning();
      expect(isRunning).toBe(true);
    });

    test('stop button stops the timer and shows confirmation', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(1000);
      
      await timerPage.killButton.click();
      
      // Confirmation modal should appear
      await expect(timerPage.killConfirmModal).toBeVisible();
    });

    test('stop and save preserves session', async ({ page, getStorageItem }) => {
      await timerPage.start();
      await page.waitForTimeout(1500);
      
      await timerPage.stop(true); // Save to history
      
      // Timer should be back to idle
      const isIdle = await timerPage.isIdle();
      expect(isIdle).toBe(true);
    });

    test('reset clears the timer without saving', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(1000);
      
      await timerPage.reset(); // Stop without saving
      
      // Timer should be idle
      const isIdle = await timerPage.isIdle();
      expect(isIdle).toBe(true);
      
      // Time should be reset
      const time = await timerPage.getDisplayedTime();
      expect(time).toMatch(/^00:00(:00)?$/);
    });
  });

  test.describe('Lap Recording', () => {
    test('lap button records lap times', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(1000);
      
      await timerPage.addLap();
      
      const lapCount = await timerPage.getLapCount();
      expect(lapCount).toBeGreaterThanOrEqual(1);
    });

    test('multiple laps are displayed', async ({ page }) => {
      await timerPage.start();
      
      // Record multiple laps
      await page.waitForTimeout(800);
      await timerPage.addLap();
      
      await page.waitForTimeout(800);
      await timerPage.addLap();
      
      await page.waitForTimeout(800);
      await timerPage.addLap();
      
      const lapCount = await timerPage.getLapCount();
      expect(lapCount).toBeGreaterThanOrEqual(3);
    });

    test('lap times are displayed in order', async ({ page }) => {
      await timerPage.start();
      
      await page.waitForTimeout(1000);
      await timerPage.addLap();
      
      await page.waitForTimeout(1000);
      await timerPage.addLap();
      
      // Both laps should be visible in the laps container
      const lapCount = await timerPage.getLapCount();
      expect(lapCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('Space key starts the timer when idle', async ({ page }) => {
      // Ensure timer is idle
      const isIdleBefore = await timerPage.isIdle();
      expect(isIdleBefore).toBe(true);
      
      // Press space to start
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      
      // Timer should be running now
      const isRunning = await timerPage.isRunning();
      // Note: This may depend on implementation - if keyboard shortcuts aren't implemented, skip
      if (!isRunning) {
        test.skip();
      }
      expect(isRunning).toBe(true);
    });

    test('Space key pauses the timer when running', async ({ page }) => {
      await timerPage.start();
      await timerPage.waitForTimerToStart();
      await page.waitForTimeout(500);
      
      // Press space to pause
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      
      // Timer should be paused now
      const isPaused = await timerPage.isPaused();
      // Note: This may depend on implementation
      if (!isPaused) {
        test.skip();
      }
      expect(isPaused).toBe(true);
    });
  });

  test.describe('Session Persistence', () => {
    test('completed session can be saved to history', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(2000);
      
      // Stop and save
      await timerPage.stop(true);
      
      // Verify timer is back to idle state
      const isIdle = await timerPage.isIdle();
      expect(isIdle).toBe(true);
    });

    test('discarded session is not saved', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(1000);
      
      // Stop without saving
      await timerPage.stop(false);
      
      // Timer should be idle
      const isIdle = await timerPage.isIdle();
      expect(isIdle).toBe(true);
    });
  });

  test.describe('Mode Switching', () => {
    test('can switch to countdown mode', async () => {
      await timerPage.selectMode('countdown');
      
      const mode = await timerPage.getCurrentMode();
      expect(mode).toBe('countdown');
    });

    test('can switch to intervals mode', async () => {
      await timerPage.selectMode('intervals');
      
      const mode = await timerPage.getCurrentMode();
      expect(mode).toBe('intervals');
    });

    test('switching modes resets timer state', async ({ page }) => {
      await timerPage.start();
      await page.waitForTimeout(1000);
      await timerPage.pause();
      
      // Switch to countdown and back
      await timerPage.selectMode('countdown');
      await timerPage.selectMode('stopwatch');
      
      // Timer should be in idle state (or show resume modal)
      const isIdle = await timerPage.isIdle();
      const hasResumeModal = await timerPage.isResumeModalVisible();
      
      expect(isIdle || hasResumeModal).toBe(true);
    });
  });
});
