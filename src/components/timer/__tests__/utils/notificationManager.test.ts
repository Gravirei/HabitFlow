/**

// Type declarations for test environment
declare const global: typeof globalThis
declare const process: NodeJS.Process

 * NotificationManager Tests
 * 
 * Comprehensive test suite for browser notification functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { notificationManager, NotificationManager } from '../../utils/notificationManager'

// Mock Notification API
class MockNotification {
  title: string
  options: NotificationOptions
  onclick: ((this: Notification, ev: Event) => any) | null = null
  onerror: ((this: Notification, ev: Event) => any) | null = null

  constructor(title: string, options?: NotificationOptions) {
    this.title = title
    this.options = options || {}
  }

  close() {
    // Mock close method
  }

  static permission: NotificationPermission = 'default'
  
  static async requestPermission(): Promise<NotificationPermission> {
    return MockNotification.permission
  }
}

describe('NotificationManager', () => {
  let originalNotification: any

  beforeEach(() => {
    // Save original Notification
    originalNotification = (global as any).Notification

    // Reset permission to default
    MockNotification.permission = 'default'
    
    // Mock Notification API
    ;(global as any).Notification = MockNotification
    
    // Clear console spies
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore original Notification
    ;(global as any).Notification = originalNotification
    vi.restoreAllMocks()
  })

  describe('Browser Support Detection', () => {
    it('should detect when notifications are supported', () => {
      expect(notificationManager.isSupported()).toBe(true)
    })

    it('should detect when notifications are not supported', () => {
      // Remove Notification API
      delete (global as any).Notification

      // Create new instance to test
      const manager = NotificationManager.getInstance()
      
      expect(manager.isSupported()).toBe(false)
    })

    it('should return denied permission when not supported', () => {
      delete (global as any).Notification
      const manager = NotificationManager.getInstance()
      
      expect(manager.getPermission()).toBe('denied')
    })
  })

  describe('Permission Management', () => {
    it('should get current permission status', () => {
      MockNotification.permission = 'granted'
      expect(notificationManager.getPermission()).toBe('granted')

      MockNotification.permission = 'denied'
      expect(notificationManager.getPermission()).toBe('denied')

      MockNotification.permission = 'default'
      expect(notificationManager.getPermission()).toBe('default')
    })

    it('should check if permission is granted', () => {
      MockNotification.permission = 'granted'
      expect(notificationManager.isPermissionGranted()).toBe(true)

      MockNotification.permission = 'denied'
      expect(notificationManager.isPermissionGranted()).toBe(false)

      MockNotification.permission = 'default'
      expect(notificationManager.isPermissionGranted()).toBe(false)
    })

    it('should return true if permission already granted', async () => {
      MockNotification.permission = 'granted'
      const result = await notificationManager.requestPermission()
      expect(result).toBe(true)
    })

    it('should return false if permission already denied', async () => {
      MockNotification.permission = 'denied'
      const result = await notificationManager.requestPermission()
      expect(result).toBe(false)
    })

    it('should request permission and return true when granted', async () => {
      MockNotification.permission = 'default'
      
      // Mock permission request to grant
      MockNotification.requestPermission = vi.fn().mockResolvedValue('granted')
      
      const result = await notificationManager.requestPermission()
      
      expect(MockNotification.requestPermission).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should request permission and return false when denied', async () => {
      MockNotification.permission = 'default'
      
      // Mock permission request to deny
      MockNotification.requestPermission = vi.fn().mockResolvedValue('denied')
      
      const result = await notificationManager.requestPermission()
      
      expect(MockNotification.requestPermission).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should handle permission request errors', async () => {
      MockNotification.permission = 'default'
      
      // Mock permission request to throw error
      MockNotification.requestPermission = vi.fn().mockRejectedValue(new Error('Permission error'))
      
      const result = await notificationManager.requestPermission()
      
      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalled()
    })

    it('should return false when requesting permission on unsupported browser', async () => {
      delete (global as any).Notification
      const manager = NotificationManager.getInstance()
      
      const result = await manager.requestPermission()
      expect(result).toBe(false)
    })
  })

  describe('Showing Notifications', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted'
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should show notification with correct title and message', async () => {
      const notification = await notificationManager.showNotification({
        title: 'Test Title',
        message: 'Test message'
      })

      expect(notification).toBeTruthy()
      expect(notification?.title).toBe('Test Title')
      expect(notification?.options.body).toBe('Test message')
    })

    it('should use default title if not provided', async () => {
      const notification = await notificationManager.showNotification({
        message: 'Test message'
      })

      expect(notification?.title).toBe('Timer Complete!')
    })

    it('should include icon and badge', async () => {
      const notification = await notificationManager.showNotification({
        message: 'Test',
        icon: '/custom-icon.png',
        badge: '/custom-badge.png'
      })

      expect(notification?.options.icon).toBe('/custom-icon.png')
      expect(notification?.options.badge).toBe('/custom-badge.png')
    })

    it('should use default icon if not provided', async () => {
      const notification = await notificationManager.showNotification({
        message: 'Test'
      })

      expect(notification?.options.icon).toBe('/vite.svg')
      expect(notification?.options.badge).toBe('/vite.svg')
    })

    it('should auto-close notification after duration', async () => {
      const notification = await notificationManager.showNotification({
        message: 'Test',
        autoCloseDuration: 3000
      })

      const closeSpy = vi.spyOn(notification!, 'close')

      // Fast-forward time
      vi.advanceTimersByTime(3000)

      expect(closeSpy).toHaveBeenCalled()
    })

    it('should not auto-close if duration is 0', async () => {
      const notification = await notificationManager.showNotification({
        message: 'Test',
        autoCloseDuration: 0
      })

      const closeSpy = vi.spyOn(notification!, 'close')

      vi.advanceTimersByTime(10000)

      expect(closeSpy).not.toHaveBeenCalled()
    })

    it('should focus window when notification is clicked', async () => {
      const focusSpy = vi.spyOn(window, 'focus')
      
      const notification = await notificationManager.showNotification({
        message: 'Test'
      })

      const closeSpy = vi.spyOn(notification!, 'close')

      // Simulate click
      notification!.onclick?.call(notification as any, new Event('click'))

      expect(focusSpy).toHaveBeenCalled()
      expect(closeSpy).toHaveBeenCalled()
    })

    it('should return null when permission not granted', async () => {
      MockNotification.permission = 'denied'

      const notification = await notificationManager.showNotification({
        message: 'Test'
      })

      expect(notification).toBeNull()
    })

    it('should return null when browser not supported', async () => {
      delete (global as any).Notification
      const manager = NotificationManager.getInstance()

      const notification = await manager.showNotification({
        message: 'Test'
      })

      expect(notification).toBeNull()
    })

    it('should handle notification creation errors', async () => {
      // Mock Notification constructor to throw error
      const OriginalNotification = (global as any).Notification
      ;(global as any).Notification = vi.fn(() => {
        throw new Error('Notification error')
      })
      ;(global as any).Notification.permission = 'granted'

      const notification = await notificationManager.showNotification({
        message: 'Test'
      })

      expect(notification).toBeNull()
      expect(console.error).toHaveBeenCalled()

      // Restore
      ;(global as any).Notification = OriginalNotification
    })
  })

  describe('Timer-Specific Notifications', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted'
    })

    it('should show Stopwatch completion notification', async () => {
      const notification = await notificationManager.showTimerComplete(
        'Great job!',
        'Stopwatch',
        120
      )

      expect(notification?.title).toContain('⏱️')
      expect(notification?.title).toContain('Stopwatch')
      expect(notification?.options.body).toContain('Great job!')
    })

    it('should show Countdown completion notification', async () => {
      const notification = await notificationManager.showTimerComplete(
        'Time is up!',
        'Countdown',
        300
      )

      expect(notification?.title).toContain('⏲️')
      expect(notification?.title).toContain('Countdown')
      expect(notification?.options.body).toContain('Time is up!')
    })

    it('should show Intervals completion notification', async () => {
      const notification = await notificationManager.showTimerComplete(
        'Session complete!',
        'Intervals',
        600
      )

      expect(notification?.title).toContain('🔄')
      expect(notification?.title).toContain('Intervals')
      expect(notification?.options.body).toContain('Session complete!')
    })

    it('should include duration in message when provided', async () => {
      const notification = await notificationManager.showTimerComplete(
        'Done!',
        'Countdown',
        125 // 2m 5s
      )

      expect(notification?.options.body).toContain('2m 5s')
    })

    it('should format duration correctly for seconds only', async () => {
      const notification = await notificationManager.showTimerComplete(
        'Done!',
        'Countdown',
        45
      )

      expect(notification?.options.body).toContain('45s')
      expect(notification?.options.body).not.toContain('0m')
    })

    it('should work without duration', async () => {
      const notification = await notificationManager.showTimerComplete(
        'Done!',
        'Stopwatch'
      )

      expect(notification).toBeTruthy()
      expect(notification?.options.body).toBe('Done!')
    })
  })

  describe('Test Notification', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted'
    })

    it('should show test notification', async () => {
      const notification = await notificationManager.showTestNotification()

      expect(notification).toBeTruthy()
      expect(notification?.title).toContain('Test Notification')
      expect(notification?.options.body).toContain('Notifications are working')
    })
  })

  describe('Utility Methods', () => {
    it('should check if notification can be shown', () => {
      MockNotification.permission = 'granted'
      expect(notificationManager.canShowNotification()).toBe(true)

      MockNotification.permission = 'denied'
      expect(notificationManager.canShowNotification()).toBe(false)

      MockNotification.permission = 'default'
      expect(notificationManager.canShowNotification()).toBe(false)
    })

    it('should return false for canShowNotification when not supported', () => {
      delete (global as any).Notification
      const manager = NotificationManager.getInstance()

      expect(manager.canShowNotification()).toBe(false)
    })

    it('should return permission status message', () => {
      MockNotification.permission = 'granted'
      expect(notificationManager.getPermissionStatusMessage()).toContain('enabled')

      MockNotification.permission = 'denied'
      expect(notificationManager.getPermissionStatusMessage()).toContain('blocked')

      MockNotification.permission = 'default'
      expect(notificationManager.getPermissionStatusMessage()).toContain('not requested')
    })

    it('should return unsupported message when browser does not support', () => {
      delete (global as any).Notification
      const manager = NotificationManager.getInstance()

      expect(manager.getPermissionStatusMessage()).toContain('does not support')
    })
  })

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = NotificationManager.getInstance()
      const instance2 = NotificationManager.getInstance()

      expect(instance1).toBe(instance2)
    })
  })
})
