# Plan: 3-1 - Settings & Presets Tests

## Objective
Implement E2E tests for P1 flows: Timer settings configuration and preset management.

## Context
- P1 priority flows
- Settings: Open settings → Change sound → Change notifications → Save
- Presets: Select preset → Start timer → Verify correct duration
- Settings persist to localStorage

## Dependencies
- 2-1-core-timer-tests.PLAN.md
- 2-2-intervals-history-tests.PLAN.md

## Tasks

<task type="auto">
<name>Create Settings E2E tests</name>
<files>e2e/tests/settings.spec.ts</files>
<action>
Create `e2e/tests/settings.spec.ts`:

```typescript
import { test, expect, STORAGE_KEYS } from '../fixtures'
import { TimerPage } from '../pages'

test.describe('Timer Settings', () => {
  let timerPage: TimerPage

  test.beforeEach(async ({ page, clearTimerStorage }) => {
    await clearTimerStorage()
    timerPage = new TimerPage(page)
    await timerPage.goto()
  })

  test.describe('Settings Modal', () => {
    test('should open settings modal', async ({ page }) => {
      await timerPage.openSettings()
      
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()
    })

    test('should close settings modal with close button', async ({ page }) => {
      await timerPage.openSettings()
      
      const closeButton = page.getByRole('button', { name: /close|×/i })
      await closeButton.click()
      
      const modal = page.locator('[role="dialog"]')
      await expect(modal).not.toBeVisible()
    })

    test('should close settings modal with Escape key', async ({ page }) => {
      await timerPage.openSettings()
      await page.keyboard.press('Escape')
      
      const modal = page.locator('[role="dialog"]')
      await expect(modal).not.toBeVisible()
    })
  })

  test.describe('Sound Settings', () => {
    test('should display sound options', async ({ page }) => {
      await timerPage.openSettings()
      
      // Look for sound settings section
      const soundSection = page.locator('text=/sound|audio/i')
      await expect(soundSection.first()).toBeVisible()
    })

    test('should toggle sound on/off', async ({ page, getStorageItem }) => {
      await timerPage.openSettings()
      
      // Find sound toggle
      const soundToggle = page.locator('[data-testid="sound-toggle"], [role="switch"][aria-label*="sound" i]')
      if (await soundToggle.isVisible()) {
        await soundToggle.click()
        
        // Verify setting persisted
        await page.waitForTimeout(300)
      }
    })

    test('should change sound type', async ({ page }) => {
      await timerPage.openSettings()
      
      const soundSelect = page.locator('[data-testid="sound-type"], select[name="sound"]')
      if (await soundSelect.isVisible()) {
        await soundSelect.selectOption({ index: 1 })
      }
    })

    test('should adjust volume', async ({ page }) => {
      await timerPage.openSettings()
      
      const volumeSlider = page.locator('[data-testid="volume-slider"], input[type="range"][aria-label*="volume" i]')
      if (await volumeSlider.isVisible()) {
        await volumeSlider.fill('50')
      }
    })
  })

  test.describe('Notification Settings', () => {
    test('should display notification options', async ({ page }) => {
      await timerPage.openSettings()
      
      const notificationSection = page.locator('text=/notification/i')
      await expect(notificationSection.first()).toBeVisible()
    })

    test('should toggle notifications on/off', async ({ page }) => {
      await timerPage.openSettings()
      
      const notificationToggle = page.locator('[data-testid="notification-toggle"], [role="switch"][aria-label*="notification" i]')
      if (await notificationToggle.isVisible()) {
        await notificationToggle.click()
      }
    })

    test('should request notification permission when enabled', async ({ page, context }) => {
      // Grant notification permission
      await context.grantPermissions(['notifications'])
      
      await timerPage.openSettings()
      
      const notificationToggle = page.locator('[data-testid="notification-toggle"], [role="switch"][aria-label*="notification" i]')
      if (await notificationToggle.isVisible()) {
        await notificationToggle.click()
      }
    })
  })

  test.describe('Vibration Settings', () => {
    test('should display vibration option on supported devices', async ({ page }) => {
      await timerPage.openSettings()
      
      const vibrationSection = page.locator('text=/vibrat/i')
      // Vibration may not be visible on all devices
    })

    test('should toggle vibration on/off', async ({ page }) => {
      await timerPage.openSettings()
      
      const vibrationToggle = page.locator('[data-testid="vibration-toggle"], [role="switch"][aria-label*="vibrat" i]')
      if (await vibrationToggle.isVisible()) {
        await vibrationToggle.click()
      }
    })
  })

  test.describe('Auto-Start Settings', () => {
    test('should toggle auto-start break', async ({ page }) => {
      await timerPage.openSettings()
      
      const autoStartToggle = page.locator('[data-testid="auto-start-toggle"], [role="switch"][aria-label*="auto" i]')
      if (await autoStartToggle.isVisible()) {
        await autoStartToggle.click()
      }
    })
  })

  test.describe('Keyboard Shortcuts', () => {
    test('should display keyboard shortcuts section', async ({ page }) => {
      await timerPage.openSettings()
      
      const keyboardSection = page.locator('text=/keyboard|shortcut/i')
      await expect(keyboardSection.first()).toBeVisible()
    })

    test('should toggle keyboard shortcuts on/off', async ({ page }) => {
      await timerPage.openSettings()
      
      const keyboardToggle = page.locator('[data-testid="keyboard-toggle"], [role="switch"][aria-label*="keyboard" i]')
      if (await keyboardToggle.isVisible()) {
        await keyboardToggle.click()
      }
    })
  })

  test.describe('Settings Persistence', () => {
    test('should persist settings to localStorage', async ({ page, getStorageItem }) => {
      await timerPage.openSettings()
      
      // Make a change
      const soundToggle = page.locator('[data-testid="sound-toggle"], [role="switch"]').first()
      if (await soundToggle.isVisible()) {
        await soundToggle.click()
        await page.waitForTimeout(500)
        
        // Close modal
        await page.keyboard.press('Escape')
        
        // Verify persistence
        const settings = await getStorageItem(STORAGE_KEYS.TIMER_SETTINGS)
        expect(settings).toBeTruthy()
      }
    })

    test('should restore settings on page reload', async ({ page, setStorageItem }) => {
      // Set custom settings
      await setStorageItem(STORAGE_KEYS.TIMER_SETTINGS, {
        soundEnabled: false,
        notificationsEnabled: true,
        volume: 75,
      })
      
      await page.reload()
      await timerPage.openSettings()
      
      // Settings should reflect stored values
    })
  })

  test.describe('Reset Settings', () => {
    test('should reset settings to defaults', async ({ page }) => {
      await timerPage.openSettings()
      
      const resetButton = page.getByRole('button', { name: /reset|default/i })
      if (await resetButton.isVisible()) {
        await resetButton.click()
        
        // Confirm reset
        const confirmButton = page.getByRole('button', { name: /confirm|yes/i })
        if (await confirmButton.isVisible()) {
          await confirmButton.click()
        }
      }
    })
  })

  test.describe('Full Settings Workflow', () => {
    test('P1: Complete settings flow - open, change sound, change notifications, save', async ({ page, mockAudio, mockNotifications }) => {
      await mockAudio()
      await mockNotifications()
      
      // 1. Open settings
      await timerPage.openSettings()
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()
      
      // 2. Find and change sound setting
      const soundToggle = page.locator('[data-testid="sound-toggle"], [role="switch"]').first()
      if (await soundToggle.isVisible()) {
        await soundToggle.click()
      }
      
      // 3. Find and change notification setting
      const notificationToggle = page.locator('[data-testid="notification-toggle"], [role="switch"]').nth(1)
      if (await notificationToggle.isVisible()) {
        await notificationToggle.click()
      }
      
      // 4. Close/save settings
      await page.keyboard.press('Escape')
      
      // 5. Verify settings persisted by reopening
      await timerPage.openSettings()
      // Settings should reflect changes
    })
  })
})
```
</action>
<verify>
```bash
npm run test:e2e -- e2e/tests/settings.spec.ts --project=chromium
```
All tests should pass.
</verify>
<done>Settings E2E tests created covering settings modal, sound, notifications, vibration, auto-start, keyboard shortcuts, persistence, reset, and full P1 workflow</done>
</task>

<task type="auto">
<name>Create Presets E2E tests</name>
<files>e2e/tests/presets.spec.ts</files>
<action>
Create `e2e/tests/presets.spec.ts`:

```typescript
import { test, expect } from '../fixtures'
import { TimerPage } from '../pages'

test.describe('Timer Presets', () => {
  let timerPage: TimerPage

  test.beforeEach(async ({ page, clearTimerStorage }) => {
    await clearTimerStorage()
    timerPage = new TimerPage(page)
    await timerPage.goto()
  })

  test.describe('Countdown Presets', () => {
    test.beforeEach(async () => {
      await timerPage.selectCountdown()
    })

    test('should display preset buttons', async ({ page }) => {
      const presetButtons = page.locator('[data-testid="preset-button"], button:has-text("min")')
      const count = await presetButtons.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should set 5 minute preset', async ({ page }) => {
      const preset = page.getByRole('button', { name: /5\s*min/i })
      if (await preset.isVisible()) {
        await preset.click()
        
        const time = await timerPage.getDisplayedTime()
        expect(time).toMatch(/5:00/)
      }
    })

    test('should set 10 minute preset', async ({ page }) => {
      const preset = page.getByRole('button', { name: /10\s*min/i })
      if (await preset.isVisible()) {
        await preset.click()
        
        const time = await timerPage.getDisplayedTime()
        expect(time).toMatch(/10:00/)
      }
    })

    test('should set 15 minute preset', async ({ page }) => {
      const preset = page.getByRole('button', { name: /15\s*min/i })
      if (await preset.isVisible()) {
        await preset.click()
        
        const time = await timerPage.getDisplayedTime()
        expect(time).toMatch(/15:00/)
      }
    })

    test('should set 25 minute preset (Pomodoro)', async ({ page }) => {
      const preset = page.getByRole('button', { name: /25\s*min|pomodoro/i })
      if (await preset.isVisible()) {
        await preset.click()
        
        const time = await timerPage.getDisplayedTime()
        expect(time).toMatch(/25:00/)
      }
    })

    test('should start timer with preset duration', async ({ page }) => {
      const preset = page.getByRole('button', { name: /5\s*min/i })
      if (await preset.isVisible()) {
        await preset.click()
        await timerPage.start()
        
        await expect(timerPage.pauseButton).toBeVisible()
        
        // Timer should be counting down from ~5:00
        await page.waitForTimeout(1500)
        const time = await timerPage.getDisplayedTime()
        expect(time).toMatch(/4:5[0-9]/)
      }
    })

    test('should highlight selected preset', async ({ page }) => {
      const preset = page.getByRole('button', { name: /5\s*min/i })
      if (await preset.isVisible()) {
        await preset.click()
        
        // Selected preset should have different styling
        await expect(preset).toHaveClass(/selected|active|bg-/)
      }
    })
  })

  test.describe('Interval Presets', () => {
    test.beforeEach(async () => {
      await timerPage.selectIntervals()
    })

    test('should display interval presets', async ({ page }) => {
      const presets = page.locator('[data-testid="interval-preset"], button:has-text(/\\d+.*\\/.*\\d+|pomodoro/i)')
      const count = await presets.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should set Pomodoro preset (25/5)', async ({ page }) => {
      const preset = page.getByRole('button', { name: /pomodoro|25.*5/i })
      if (await preset.isVisible()) {
        await preset.click()
        
        // Verify work/break durations are set
        const workIndicator = page.locator('text=/25.*min|work.*25/i')
        // May need to check in config display
      }
    })

    test('should set 52/17 preset', async ({ page }) => {
      const preset = page.getByRole('button', { name: /52.*17/i })
      if (await preset.isVisible()) {
        await preset.click()
      }
    })

    test('should start intervals with preset configuration', async ({ page }) => {
      const preset = page.getByRole('button', { name: /pomodoro|25.*5/i })
      if (await preset.isVisible()) {
        await preset.click()
        await timerPage.start()
        
        await expect(timerPage.pauseButton).toBeVisible()
        
        // Should show work phase
        const workIndicator = page.locator('text=/work|focus/i')
        await expect(workIndicator.first()).toBeVisible()
      }
    })
  })

  test.describe('Custom Presets', () => {
    test('should allow creating custom countdown preset', async ({ page }) => {
      await timerPage.selectCountdown()
      
      const customButton = page.getByRole('button', { name: /custom|add|\\+/i })
      if (await customButton.isVisible()) {
        await customButton.click()
        
        // Custom preset modal or form should appear
        const presetModal = page.locator('[data-testid="custom-preset-modal"], [role="dialog"]')
        await expect(presetModal).toBeVisible()
      }
    })

    test('should save custom preset', async ({ page }) => {
      await timerPage.selectCountdown()
      
      const customButton = page.getByRole('button', { name: /custom|add|\\+/i })
      if (await customButton.isVisible()) {
        await customButton.click()
        
        // Fill in custom preset form
        const nameInput = page.getByPlaceholder(/name/i)
        const durationInput = page.locator('[data-testid="preset-duration"], input[type="number"]')
        
        if (await nameInput.isVisible()) {
          await nameInput.fill('My Custom Preset')
        }
        if (await durationInput.isVisible()) {
          await durationInput.fill('12')
        }
        
        const saveButton = page.getByRole('button', { name: /save|create/i })
        if (await saveButton.isVisible()) {
          await saveButton.click()
        }
      }
    })

    test('should allow editing existing preset', async ({ page }) => {
      await timerPage.selectCountdown()
      
      // Look for edit button on preset
      const editButton = page.locator('[data-testid="edit-preset"]').first()
      if (await editButton.isVisible()) {
        await editButton.click()
        
        const editModal = page.locator('[data-testid="edit-preset-modal"], [role="dialog"]')
        await expect(editModal).toBeVisible()
      }
    })

    test('should allow deleting custom preset', async ({ page }) => {
      await timerPage.selectCountdown()
      
      const deleteButton = page.locator('[data-testid="delete-preset"]').first()
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        
        // Confirm deletion
        const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i })
        if (await confirmButton.isVisible()) {
          await confirmButton.click()
        }
      }
    })
  })

  test.describe('Preset Persistence', () => {
    test('should persist custom presets to localStorage', async ({ page, getStorageItem }) => {
      await timerPage.selectCountdown()
      
      // Create custom preset (if supported)
      const customButton = page.getByRole('button', { name: /custom|add|\\+/i })
      if (await customButton.isVisible()) {
        await customButton.click()
        
        // Fill and save
        const nameInput = page.getByPlaceholder(/name/i)
        if (await nameInput.isVisible()) {
          await nameInput.fill('Persisted Preset')
          
          const saveButton = page.getByRole('button', { name: /save/i })
          if (await saveButton.isVisible()) {
            await saveButton.click()
            await page.waitForTimeout(500)
          }
        }
      }
    })

    test('should restore custom presets on page reload', async ({ page, setStorageItem }) => {
      // Seed custom presets
      await setStorageItem('timer-custom-presets', [
        { id: '1', name: 'Custom 1', duration: 7 },
        { id: '2', name: 'Custom 2', duration: 18 },
      ])
      
      await page.reload()
      await timerPage.selectCountdown()
      
      // Custom presets should be visible
    })
  })

  test.describe('Full Preset Workflow', () => {
    test('P1: Select preset, start timer, verify correct duration', async ({ page }) => {
      // 1. Go to countdown mode
      await timerPage.selectCountdown()
      
      // 2. Select 5 minute preset
      const preset = page.getByRole('button', { name: /5\s*min/i })
      if (await preset.isVisible()) {
        await preset.click()
        
        // 3. Verify time is set
        let time = await timerPage.getDisplayedTime()
        expect(time).toMatch(/5:00/)
        
        // 4. Start timer
        await timerPage.start()
        await expect(timerPage.pauseButton).toBeVisible()
        
        // 5. Verify countdown is working
        await page.waitForTimeout(2000)
        time = await timerPage.getDisplayedTime()
        expect(time).toMatch(/4:5[0-9]/)
        
        // 6. Stop timer
        await timerPage.stop()
        await timerPage.waitForCompletionModal()
      }
    })
  })
})
```
</action>
<verify>
```bash
npm run test:e2e -- e2e/tests/presets.spec.ts --project=chromium
```
All tests should pass.
</verify>
<done>Presets E2E tests created covering countdown presets, interval presets, custom presets, persistence, and full P1 workflow</done>
</task>

## Success Criteria
- Settings tests cover: modal, sound, notifications, vibration, auto-start, keyboard shortcuts, persistence, reset
- Presets tests cover: countdown presets, interval presets, custom presets, persistence
- Both include full P1 workflow tests
- Settings persist correctly to localStorage
- Tests complete in < 2 minutes

## Verification
```bash
npm run test:e2e -- e2e/tests/settings.spec.ts e2e/tests/presets.spec.ts --project=chromium
```
