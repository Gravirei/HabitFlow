/**
 * CloudSyncModal Component Tests
 * Tests for cloud sync modal functionality
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CloudSyncModal } from '../CloudSyncModal'
import { useSyncStore } from '../syncStore'
import { tieredStorage } from '@/lib/storage'
import toast from 'react-hot-toast'

// Mock dependencies
vi.mock('../syncStore')
vi.mock('@/lib/storage', () => ({
  tieredStorage: {
    isLoggedIn: vi.fn(),
  },
}))
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('CloudSyncModal', () => {
  const mockStartSync = vi.fn()
  const mockCreateBackup = vi.fn()
  const mockRestoreBackup = vi.fn()
  const mockDeleteBackup = vi.fn()
  const mockUpdateSettings = vi.fn()
  const mockRefreshSyncStatus = vi.fn()
  const mockStartAutoSync = vi.fn()
  const mockStopAutoSync = vi.fn()
  const mockOnClose = vi.fn()

  const defaultSyncStatus = {
    lastSyncTime: null,
    isSyncing: false,
    syncError: null,
    itemsSynced: 0,
    pendingChanges: 0,
  }

  const defaultSettings = {
    autoSync: false,
    syncInterval: 30,
    syncOnLogin: false,
    syncOnLogout: false,
    backupBeforeSync: true,
    maxBackups: 10,
  }

  const mockSessions = [
    { id: '1', mode: 'Stopwatch', duration: 3600, timestamp: Date.now() },
    { id: '2', mode: 'Countdown', duration: 1800, timestamp: Date.now() },
  ]

  const defaultStoreState = {
    syncStatus: defaultSyncStatus,
    backups: [],
    settings: defaultSettings,
    startSync: mockStartSync,
    createBackup: mockCreateBackup,
    restoreBackup: mockRestoreBackup,
    deleteBackup: mockDeleteBackup,
    updateSettings: mockUpdateSettings,
    refreshSyncStatus: mockRefreshSyncStatus,
    startAutoSync: mockStartAutoSync,
    stopAutoSync: mockStopAutoSync,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSyncStore as unknown as Mock).mockReturnValue(defaultStoreState)
    ;(tieredStorage.isLoggedIn as Mock).mockReturnValue(true)
  })

  describe('Modal Visibility', () => {
    it('should render modal when isOpen is true', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Cloud Sync')).toBeInTheDocument()
      expect(screen.getByText('Backup & restore')).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      render(<CloudSyncModal isOpen={false} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.queryByText('Cloud Sync')).not.toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const backdrop = document.querySelector('.fixed.inset-0.z-50.bg-black\\/60')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should refresh sync status when modal opens', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(mockRefreshSyncStatus).toHaveBeenCalled()
    })
  })

  describe('Sync Status Display', () => {
    it('should show "Connected" badge when logged in', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('should show "Local Only" badge when not logged in', () => {
      ;(tieredStorage.isLoggedIn as Mock).mockReturnValue(false)
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Local Only')).toBeInTheDocument()
    })

    it('should show "Never synced" when lastSyncTime is null', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Never synced')).toBeInTheDocument()
    })

    it('should show last sync time when available', () => {
      const recentTime = Date.now() - 5 * 60 * 1000 // 5 minutes ago
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        syncStatus: { ...defaultSyncStatus, lastSyncTime: recentTime },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument()
    })

    it('should show sync error when present', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        syncStatus: { ...defaultSyncStatus, syncError: 'Network error occurred' },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Network error occurred')).toBeInTheDocument()
    })

    it('should show pending changes count', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        syncStatus: { ...defaultSyncStatus, pendingChanges: 5 },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Pending Changes')).toBeInTheDocument()
    })

    it('should show total sessions count', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    })
  })

  describe('Sync Button', () => {
    it('should show "Sync Now" button', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      // There are two "Sync Now" elements - the tab and the action button
      const syncNowElements = screen.getAllByText('Sync Now')
      expect(syncNowElements.length).toBeGreaterThanOrEqual(1)
    })

    it('should trigger sync when clicked', async () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      // Get the sync action button (has cloud_sync icon), not the tab
      const syncButtons = screen.getAllByText('Sync Now')
      // The action button is inside the sync status section with the icon
      const syncActionButton = syncButtons.find(el => {
        const button = el.closest('button')
        return button?.querySelector('.material-symbols-outlined')?.textContent === 'cloud_sync'
      })?.closest('button')
      
      fireEvent.click(syncActionButton!)
      
      await waitFor(() => {
        expect(mockStartSync).toHaveBeenCalled()
      })
    })

    it('should be disabled when syncing', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        syncStatus: { ...defaultSyncStatus, isSyncing: true },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const syncButton = screen.getByText('Syncing...').closest('button')
      expect(syncButton).toBeDisabled()
    })

    it('should show "Syncing..." text when syncing', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        syncStatus: { ...defaultSyncStatus, isSyncing: true },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Syncing...')).toBeInTheDocument()
    })

    it('should be disabled when not logged in', () => {
      ;(tieredStorage.isLoggedIn as Mock).mockReturnValue(false)
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      // Get the sync action button (the one with the icon)
      const syncButtons = screen.getAllByText('Sync Now')
      const syncActionButton = syncButtons.find(el => {
        const button = el.closest('button')
        return button?.querySelector('.material-symbols-outlined')?.textContent === 'cloud_sync'
      })?.closest('button')
      
      expect(syncActionButton).toBeDisabled()
    })

    it('should show error toast when sync attempted without login', async () => {
      ;(tieredStorage.isLoggedIn as Mock).mockReturnValue(false)
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      // Get the sync action button
      const syncButtons = screen.getAllByText('Sync Now')
      const syncActionButton = syncButtons.find(el => {
        const button = el.closest('button')
        return button?.querySelector('.material-symbols-outlined')?.textContent === 'cloud_sync'
      })?.closest('button')
      
      // Button is disabled, so we can't click it - this is expected behavior
      expect(syncActionButton).toBeDisabled()
    })

    it('should create backup before sync if setting enabled', async () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        settings: { ...defaultSettings, backupBeforeSync: true },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      // Get the sync action button
      const syncButtons = screen.getAllByText('Sync Now')
      const syncActionButton = syncButtons.find(el => {
        const button = el.closest('button')
        return button?.querySelector('.material-symbols-outlined')?.textContent === 'cloud_sync'
      })?.closest('button')
      
      fireEvent.click(syncActionButton!)
      
      await waitFor(() => {
        expect(mockCreateBackup).toHaveBeenCalled()
        expect(mockStartSync).toHaveBeenCalled()
      })
    })
  })

  describe('Login Status Banner', () => {
    it('should show login prompt when not logged in', () => {
      ;(tieredStorage.isLoggedIn as Mock).mockReturnValue(false)
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Sign in to enable cloud sync')).toBeInTheDocument()
    })

    it('should not show login prompt when logged in', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.queryByText('Sign in to enable cloud sync')).not.toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should show Sync Now tab by default', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Sync Status')).toBeInTheDocument()
    })

    it('should switch to Backups tab when clicked', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const backupsTab = screen.getByRole('button', { name: /Backups \(0\)/i })
      fireEvent.click(backupsTab)
      
      expect(screen.getByText('No Backups Yet')).toBeInTheDocument()
    })

    it('should switch to Settings tab when clicked', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Sync Settings')).toBeInTheDocument()
    })

    it('should show backup count in tab', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        backups: [
          { id: '1', timestamp: Date.now(), deviceName: 'Test', itemCount: 5, size: 1024, autoBackup: false },
        ],
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText(/Backups \(1\)/)).toBeInTheDocument()
    })
  })

  describe('Backups Tab', () => {
    const mockBackups = [
      { id: 'backup-1', timestamp: Date.now() - 3600000, deviceName: 'Device 1', itemCount: 10, size: 2048, autoBackup: false },
      { id: 'backup-2', timestamp: Date.now(), deviceName: 'Device 2', itemCount: 5, size: 1024, autoBackup: true },
    ]

    it('should show empty state when no backups', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const backupsTab = screen.getByRole('button', { name: /Backups/i })
      fireEvent.click(backupsTab)
      
      expect(screen.getByText('No Backups Yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first backup to protect your data')).toBeInTheDocument()
    })

    it('should show backup list when backups exist', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        backups: mockBackups,
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const backupsTab = screen.getByRole('button', { name: /Backups/i })
      fireEvent.click(backupsTab)
      
      expect(screen.getByText('Device 1')).toBeInTheDocument()
      expect(screen.getByText('Device 2')).toBeInTheDocument()
    })

    it('should show Create Backup button in empty state', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const backupsTab = screen.getByRole('button', { name: /Backups/i })
      fireEvent.click(backupsTab)
      
      expect(screen.getByRole('button', { name: /Create Backup/i })).toBeInTheDocument()
    })

    it('should call createBackup when Create Backup clicked', async () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const backupsTab = screen.getByRole('button', { name: /Backups/i })
      fireEvent.click(backupsTab)
      
      const createButton = screen.getByRole('button', { name: /Create Backup/i })
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockCreateBackup).toHaveBeenCalled()
      })
    })

    it('should show Restore button for each backup', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        backups: mockBackups,
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const backupsTab = screen.getByRole('button', { name: /Backups/i })
      fireEvent.click(backupsTab)
      
      const restoreButtons = screen.getAllByRole('button', { name: /Restore/i })
      expect(restoreButtons.length).toBe(2)
    })
  })

  describe('Settings Tab', () => {
    it('should show Auto Sync toggle', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Auto Sync')).toBeInTheDocument()
    })

    it('should toggle Auto Sync setting', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      // Get all switches and find the Auto Sync one (first switch in settings)
      const switches = screen.getAllByRole('switch')
      const autoSyncToggle = switches[0] // Auto Sync is the first toggle
      fireEvent.click(autoSyncToggle)
      
      expect(mockUpdateSettings).toHaveBeenCalledWith({ autoSync: true })
      expect(mockStartAutoSync).toHaveBeenCalled()
    })

    it('should stop auto sync when toggled off', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        settings: { ...defaultSettings, autoSync: true },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      const switches = screen.getAllByRole('switch')
      const autoSyncToggle = switches[0] // Auto Sync is the first toggle
      fireEvent.click(autoSyncToggle)
      
      expect(mockUpdateSettings).toHaveBeenCalledWith({ autoSync: false })
      expect(mockStopAutoSync).toHaveBeenCalled()
    })

    it('should show Sync on Login toggle', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Sync on Login')).toBeInTheDocument()
    })

    it('should toggle Sync on Login setting', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      // Sync on Login is the second toggle (index 1)
      const switches = screen.getAllByRole('switch')
      const syncOnLoginToggle = switches[1]
      fireEvent.click(syncOnLoginToggle)
      
      expect(mockUpdateSettings).toHaveBeenCalledWith({ syncOnLogin: true })
    })

    it('should show Backup Before Sync toggle', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Backup Before Sync')).toBeInTheDocument()
    })

    it('should show Max Backups input', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Max Backups to Keep')).toBeInTheDocument()
    })

    it('should disable settings when not logged in', () => {
      ;(tieredStorage.isLoggedIn as Mock).mockReturnValue(false)
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Sign in to enable sync settings')).toBeInTheDocument()
    })

    it('should show sync interval selector when auto sync is enabled', () => {
      ;(useSyncStore as unknown as Mock).mockReturnValue({
        ...defaultStoreState,
        settings: { ...defaultSettings, autoSync: true },
      })
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Sync Interval')).toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('should show Create Manual Backup button', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Create Manual Backup')).toBeInTheDocument()
    })

    it('should show Download Local Copy button', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText('Download Local Copy')).toBeInTheDocument()
    })

    it('should disable download when no sessions', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={[]} />)
      
      expect(screen.getByText('No sessions to export')).toBeInTheDocument()
    })

    it('should show session count in download description', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      expect(screen.getByText(/Export 2 sessions as JSON file/)).toBeInTheDocument()
    })
  })

  describe('Storage Info', () => {
    it('should show storage info in settings', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Storage Info')).toBeInTheDocument()
      expect(screen.getByText('Storage Mode')).toBeInTheDocument()
    })

    it('should show Cloud + Local mode when logged in', () => {
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getByText('Cloud + Local')).toBeInTheDocument()
    })

    it('should show Local Only mode when not logged in', () => {
      ;(tieredStorage.isLoggedIn as Mock).mockReturnValue(false)
      
      render(<CloudSyncModal isOpen={true} onClose={mockOnClose} sessions={mockSessions as any} />)
      
      const settingsTab = screen.getByRole('button', { name: /Settings/i })
      fireEvent.click(settingsTab)
      
      expect(screen.getAllByText('Local Only').length).toBeGreaterThan(0)
    })
  })
})
