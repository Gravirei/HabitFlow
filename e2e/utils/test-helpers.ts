import { Page } from '@playwright/test'

/**
 * Format seconds into MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Parse displayed time text back to seconds
 */
export function parseDisplayedTime(text: string): number {
  const parts = text.split(':').map(Number)
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  }
  return 0
}

/**
 * Generate a mock timer session with optional overrides
 */
export function generateMockSession(overrides: {
  mode?: 'Stopwatch' | 'Countdown' | 'Intervals'
  duration?: number
  timestamp?: number
  sessionName?: string
  completed?: boolean
  [key: string]: any
} = {}) {
  const mode = overrides.mode || 'Stopwatch'
  const baseSession = {
    id: `${mode.toLowerCase().slice(0, 2)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mode,
    duration: overrides.duration || 300,
    timestamp: overrides.timestamp || Date.now(),
    sessionName: overrides.sessionName || `Test ${mode} Session`,
  }

  switch (mode) {
    case 'Stopwatch':
      return {
        ...baseSession,
        laps: [],
        ...overrides,
      }
    case 'Countdown':
      return {
        ...baseSession,
        initialDuration: overrides.initialDuration || baseSession.duration,
        completed: overrides.completed ?? true,
        ...overrides,
      }
    case 'Intervals':
      return {
        ...baseSession,
        workDuration: overrides.workDuration || 25,
        breakDuration: overrides.breakDuration || 5,
        completedLoops: overrides.completedLoops || 4,
        targetLoopCount: overrides.targetLoopCount || 4,
        ...overrides,
      }
    default:
      return baseSession
  }
}

/**
 * Mock the Notification API on a page
 */
export async function mockNotificationAPI(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.Notification = class MockNotification {
      static permission = 'granted' as NotificationPermission
      static requestPermission() {
        return Promise.resolve('granted' as NotificationPermission)
      }
      
      title: string
      options: NotificationOptions | undefined
      
      constructor(title: string, options?: NotificationOptions) {
        this.title = title
        this.options = options
        ;(window as any).__lastNotification = { title, options }
      }
      
      close() {}
      addEventListener() {}
      removeEventListener() {}
      dispatchEvent() { return true }
    } as any
  })
}

/**
 * Mock the Audio API on a page
 */
export async function mockAudioAPI(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__audioPlayed = []
    
    // Mock AudioContext
    ;(window as any).AudioContext = class MockAudioContext {
      state = 'running'
      destination = {}
      currentTime = 0
      
      createOscillator() {
        return {
          connect: () => {},
          start: () => {},
          stop: () => {},
          type: 'sine',
          frequency: { setValueAtTime: () => {} },
        }
      }
      
      createGain() {
        return {
          connect: () => {},
          gain: {
            setValueAtTime: () => {},
            linearRampToValueAtTime: () => {},
          },
        }
      }
      
      resume() {
        return Promise.resolve()
      }
      
      close() {
        return Promise.resolve()
      }
    }
    
    // Mock HTMLAudioElement
    ;(window as any).Audio = class MockAudio {
      src: string
      volume = 1
      muted = false
      
      constructor(src?: string) {
        this.src = src || ''
      }
      
      play() {
        (window as any).__audioPlayed.push(this.src)
        return Promise.resolve()
      }
      
      pause() {}
      load() {}
    }
  })
}

/**
 * Wait for the page to be fully loaded and interactive
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  // Wait for React to hydrate
  await page.waitForTimeout(100)
}

/**
 * Navigate to timer page
 */
export async function navigateToTimer(page: Page): Promise<void> {
  await page.goto('/timer')
  await waitForAppReady(page)
}

/**
 * Get the current timer display value
 */
export async function getTimerDisplayValue(page: Page): Promise<string> {
  const display = page.locator('[data-testid="timer-display"]')
  return await display.textContent() || ''
}
