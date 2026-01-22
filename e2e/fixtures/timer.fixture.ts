import { test as base, Page } from '@playwright/test'

// Custom fixture type
export type TimerFixtures = {
  mockTime: (timestamp: number) => Promise<void>
  advanceTime: (ms: number) => Promise<void>
  mockNotifications: () => Promise<void>
  mockAudio: () => Promise<void>
  waitForTimerUpdate: () => Promise<void>
}

export const test = base.extend<TimerFixtures>({
  // Mock Date.now() to a specific timestamp
  mockTime: async ({ page }, use) => {
    const mockTime = async (timestamp: number) => {
      await page.addInitScript(`{
        const originalDate = Date;
        let mockTimestamp = ${timestamp};
        
        Date = class extends originalDate {
          constructor(...args) {
            if (args.length === 0) {
              super(mockTimestamp);
            } else {
              super(...args);
            }
          }
          static now() {
            return mockTimestamp;
          }
        };
        
        window.__advanceTime = (ms) => {
          mockTimestamp += ms;
        };
        
        window.__setTime = (ts) => {
          mockTimestamp = ts;
        };
      }`)
    }
    await use(mockTime)
  },

  // Advance mocked time by milliseconds
  advanceTime: async ({ page }, use) => {
    const advanceTime = async (ms: number) => {
      await page.evaluate((milliseconds) => {
        if (window.__advanceTime) {
          window.__advanceTime(milliseconds)
        }
      }, ms)
    }
    await use(advanceTime)
  },

  // Mock Notification API
  mockNotifications: async ({ page }, use) => {
    const mockNotifications = async () => {
      await page.addInitScript(`{
        window.Notification = class {
          static permission = 'granted';
          static requestPermission() { return Promise.resolve('granted'); }
          constructor(title, options) {
            this.title = title;
            this.options = options;
            window.__lastNotification = { title, options };
          }
          close() {}
        };
      }`)
    }
    await use(mockNotifications)
  },

  // Mock Audio API
  mockAudio: async ({ page }, use) => {
    const mockAudio = async () => {
      await page.addInitScript(`{
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const OriginalAudioContext = window.AudioContext;
        
        window.AudioContext = class {
          constructor() {
            this.state = 'running';
            this.destination = {};
            this.currentTime = 0;
          }
          createOscillator() {
            return {
              connect: () => {},
              start: () => {},
              stop: () => {},
              type: 'sine',
              frequency: { setValueAtTime: () => {} }
            };
          }
          createGain() {
            return {
              connect: () => {},
              gain: { 
                setValueAtTime: () => {}, 
                linearRampToValueAtTime: () => {} 
              }
            };
          }
          resume() { return Promise.resolve(); }
          close() { return Promise.resolve(); }
        };
        
        // Mock HTMLAudioElement
        window.__audioPlayed = [];
        const OriginalAudio = window.Audio;
        window.Audio = class {
          constructor(src) {
            this.src = src;
            this.volume = 1;
            this.muted = false;
          }
          play() {
            window.__audioPlayed.push(this.src);
            return Promise.resolve();
          }
          pause() {}
          load() {}
        };
      }`)
    }
    await use(mockAudio)
  },

  // Wait for timer display to update
  waitForTimerUpdate: async ({ page }, use) => {
    const waitForTimerUpdate = async () => {
      await page.waitForTimeout(100) // Small delay for RAF
    }
    await use(waitForTimerUpdate)
  },
})

export { expect } from '@playwright/test'

// Declare global types for mocked functions
declare global {
  interface Window {
    __advanceTime?: (ms: number) => void
    __setTime?: (ts: number) => void
    __lastNotification?: { title: string; options: any }
    __audioPlayed?: string[]
  }
}
