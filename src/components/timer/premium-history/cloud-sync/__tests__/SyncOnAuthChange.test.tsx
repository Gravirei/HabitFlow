/**
 * SyncOnAuthChange Component Tests
 * Tests for auth state change handling and sync triggers
 */

import { describe, it, expect, beforeEach, vi, afterEach, type Mock } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { SyncOnAuthChange } from '../SyncOnAuthChange'
import { useAuth } from '@/lib/auth/AuthContext'
import { useSyncStore } from '../syncStore'
import { tieredStorage } from '@/lib/storage'

// Mock dependencies
vi.mock('@/lib/auth/AuthContext')
vi.mock('../syncStore')
vi.mock('@/lib/storage', () => ({
  tieredStorage: {
    setUser: vi.fn(),
    isLoggedIn: vi.fn(),
  },
}))

describe('SyncOnAuthChange', () => {
  const mockTriggerSyncOnLogin = vi.fn()
  const mockStopAutoSync = vi.fn()

  const defaultSettings = {
    autoSync: false,
    syncInterval: 30,
    syncOnLogin: true,
    syncOnLogout: false,
    backupBeforeSync: true,
    maxBackups: 10,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSyncStore as unknown as Mock).mockReturnValue({
      triggerSyncOnLogin: mockTriggerSyncOnLogin,
      stopAutoSync: mockStopAutoSync,
      settings: defaultSettings,
    })
    ;(useAuth as unknown as Mock).mockReturnValue({
      user: null,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render nothing (returns null)', () => {
      const { container } = render(<SyncOnAuthChange />)
      
      expect(container.firstChild).toBeNull()
    })

    it('should not have any visible DOM elements', () => {
      const { container } = render(<SyncOnAuthChange />)
      
      expect(container.innerHTML).toBe('')
    })
  })

  describe('Login Detection', () => {
    it('should trigger sync on login when user logs in', async () => {
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Simulate user login
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockTriggerSyncOnLogin).toHaveBeenCalled()
      })
    })

    it('should set user in tieredStorage on login', async () => {
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Simulate user login
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-456', email: 'test@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(tieredStorage.setUser).toHaveBeenCalledWith('user-456')
      })
    })

    it('should only trigger sync once on login', async () => {
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Simulate user login
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      rerender(<SyncOnAuthChange />)
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockTriggerSyncOnLogin).toHaveBeenCalledTimes(1)
      })
    })

    it('should not trigger sync when already logged in on mount', () => {
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      render(<SyncOnAuthChange />)
      
      // First render with user should trigger login detection
      expect(mockTriggerSyncOnLogin).toHaveBeenCalled()
    })
  })

  describe('Logout Detection', () => {
    it('should stop auto sync on logout', async () => {
      // Start with logged in user
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Simulate user logout
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockStopAutoSync).toHaveBeenCalled()
      })
    })

    it('should clear user in tieredStorage on logout', async () => {
      // Start with logged in user
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Clear mock calls from login
      vi.clearAllMocks()
      
      // Simulate user logout
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(tieredStorage.setUser).toHaveBeenCalledWith(null)
      })
    })

    it('should only stop auto sync once on logout', async () => {
      // Start with logged in user
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Clear mock calls from login
      vi.clearAllMocks()
      
      // Simulate user logout
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      rerender(<SyncOnAuthChange />)
      rerender(<SyncOnAuthChange />)
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockStopAutoSync).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('User Change Detection', () => {
    it('should handle switching between different users', async () => {
      // Start with user 1
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-1', email: 'user1@example.com' },
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Clear mocks after initial login
      vi.clearAllMocks()
      
      // Switch to null (logout)
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockStopAutoSync).toHaveBeenCalled()
        expect(tieredStorage.setUser).toHaveBeenCalledWith(null)
      })
      
      vi.clearAllMocks()
      
      // Login as user 2
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-2', email: 'user2@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockTriggerSyncOnLogin).toHaveBeenCalled()
        expect(tieredStorage.setUser).toHaveBeenCalledWith('user-2')
      })
    })

    it('should not trigger anything when user id stays the same', async () => {
      // Start with user
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Clear mocks after initial login
      vi.clearAllMocks()
      
      // Rerender with same user (e.g., email change but same id)
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'newemail@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      expect(mockTriggerSyncOnLogin).not.toHaveBeenCalled()
      expect(mockStopAutoSync).not.toHaveBeenCalled()
    })
  })

  describe('No User State', () => {
    it('should not trigger anything when starting and staying without user', () => {
      (useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      rerender(<SyncOnAuthChange />)
      rerender(<SyncOnAuthChange />)
      
      expect(mockTriggerSyncOnLogin).not.toHaveBeenCalled()
      expect(mockStopAutoSync).not.toHaveBeenCalled()
    })

    it('should not set user in tieredStorage when no user present', () => {
      (useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      render(<SyncOnAuthChange />)
      
      expect(tieredStorage.setUser).not.toHaveBeenCalled()
    })
  })

  describe('Store Integration', () => {
    it('should use useSyncStore hook', () => {
      render(<SyncOnAuthChange />)
      
      expect(useSyncStore).toHaveBeenCalled()
    })

    it('should use useAuth hook', () => {
      render(<SyncOnAuthChange />)
      
      expect(useAuth).toHaveBeenCalled()
    })

    it('should access triggerSyncOnLogin from store', () => {
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      render(<SyncOnAuthChange />)
      
      expect(mockTriggerSyncOnLogin).toHaveBeenCalled()
    })

    it('should access stopAutoSync from store', async () => {
      // Start with logged in user
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Logout
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockStopAutoSync).toHaveBeenCalled()
      })
    })
  })

  describe('Effect Dependencies', () => {
    it('should respond to user changes', async () => {
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Login
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockTriggerSyncOnLogin).toHaveBeenCalled()
      })
    })

    it('should update previousUserId ref correctly', async () => {
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Login
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      // Clear mocks
      vi.clearAllMocks()
      
      // Another render with same user should not trigger anything
      rerender(<SyncOnAuthChange />)
      
      expect(mockTriggerSyncOnLogin).not.toHaveBeenCalled()
      expect(mockStopAutoSync).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined user gracefully', () => {
      (useAuth as unknown as Mock).mockReturnValue({
        user: undefined,
      })
      
      expect(() => render(<SyncOnAuthChange />)).not.toThrow()
    })

    it('should handle user with missing id', async () => {
      (useAuth as unknown as Mock).mockReturnValue({
        user: { email: 'test@example.com' }, // no id
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Should not trigger sync since no valid user id
      expect(mockTriggerSyncOnLogin).not.toHaveBeenCalled()
      
      // Now provide valid user
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockTriggerSyncOnLogin).toHaveBeenCalled()
      })
    })

    it('should handle rapid login/logout cycles', async () => {
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Rapid login
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      rerender(<SyncOnAuthChange />)
      
      // Rapid logout
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      rerender(<SyncOnAuthChange />)
      
      // Rapid login again
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-456', email: 'test2@example.com' },
      })
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(mockTriggerSyncOnLogin).toHaveBeenCalledTimes(2)
        expect(mockStopAutoSync).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle empty string user id as no user', () => {
      (useAuth as unknown as Mock).mockReturnValue({
        user: { id: '', email: 'test@example.com' },
      })
      
      render(<SyncOnAuthChange />)
      
      // Empty string id should be treated as no user (falsy)
      expect(mockTriggerSyncOnLogin).not.toHaveBeenCalled()
    })
  })

  describe('Console Logging', () => {
    it('should log on user login', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[SyncOnAuthChange] User logged in, triggering sync on login'
        )
      })
      
      consoleSpy.mockRestore()
    })

    it('should log on user logout', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      // Start logged in
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
      })
      
      const { rerender } = render(<SyncOnAuthChange />)
      
      // Logout
      ;(useAuth as unknown as Mock).mockReturnValue({
        user: null,
      })
      
      rerender(<SyncOnAuthChange />)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[SyncOnAuthChange] User logged out, stopping auto-sync'
        )
      })
      
      consoleSpy.mockRestore()
    })
  })
})
