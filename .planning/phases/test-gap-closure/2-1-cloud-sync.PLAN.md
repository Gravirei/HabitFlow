# Plan: 2-1 - Cloud Sync Tests (syncStore and Components)

## Objective
Create comprehensive unit tests for the cloud sync system including syncStore and related components, with proper Supabase mocking.

## Context
- syncStore integrates with `tieredStorage` from `@/lib/storage`
- Uses Supabase for cloud synchronization
- Manages backups stored in localStorage
- Components: CloudSyncModal, SyncOnAuthChange
- All Supabase calls must be mocked

## Dependencies
- Plans 1-1, 1-2 (store testing patterns established)
- Wave 2

## Tasks

<task type="auto">
<name>Create syncStore tests with tieredStorage mocking</name>
<files>src/components/timer/premium-history/cloud-sync/__tests__/syncStore.test.ts</files>
<action>
Create comprehensive tests for `useSyncStore`:

1. **Setup**:
   - Mock tieredStorage module completely
   - Clear localStorage before each test
   - Reset store state

2. **Mock Setup**:
```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSyncStore } from '../syncStore'

// Mock tieredStorage
vi.mock('@/lib/storage', () => ({
  tieredStorage: {
    isLoggedIn: vi.fn(),
    syncToCloud: vi.fn(),
    refreshFromCloud: vi.fn(),
    getSyncStatus: vi.fn(),
  },
}))

import { tieredStorage } from '@/lib/storage'

const mockTieredStorage = tieredStorage as {
  isLoggedIn: ReturnType<typeof vi.fn>
  syncToCloud: ReturnType<typeof vi.fn>
  refreshFromCloud: ReturnType<typeof vi.fn>
  getSyncStatus: ReturnType<typeof vi.fn>
}
```

3. **Test Groups**:

**Initial State**:
- syncStatus: isSyncing false, lastSyncTime null, syncError null
- backups: empty array
- settings: autoSync false, syncInterval 30, etc.
- autoSyncIntervalId: null

**startSync**:
- When not logged in: sets syncError, does not call syncToCloud
- When logged in:
  - Sets isSyncing true
  - Calls tieredStorage.syncToCloud()
  - Calls tieredStorage.refreshFromCloud()
  - Updates syncStatus from tieredStorage.getSyncStatus()
  - Sets isSyncing false on completion
- On error: sets syncError, isSyncing false

**setSyncStatus**:
- Merges partial status updates

**refreshSyncStatus**:
- Updates from tieredStorage.getSyncStatus()

**startAutoSync**:
- Clears existing interval if any
- Does nothing if autoSync disabled
- Does nothing if not logged in
- Creates interval at correct frequency (syncInterval * 60 * 1000)
- Stores intervalId in autoSyncIntervalId

**stopAutoSync**:
- Clears interval
- Sets autoSyncIntervalId to null

**triggerSyncOnLogin**:
- Does nothing if not logged in
- Calls startSync if syncOnLogin enabled
- Calls startAutoSync if autoSync enabled

**createBackup**:
- Creates backup with correct structure (id, timestamp, deviceName, itemCount, size)
- Stores backup data in localStorage
- Adds to backups array
- Limits to maxBackups (removes oldest, cleans localStorage)

**restoreBackup**:
- Retrieves data from localStorage
- Parses and restores sessions by mode
- Throws on invalid backup data
- Throws on missing backup

**deleteBackup**:
- Removes from localStorage
- Removes from backups array

**getBackups**:
- Returns backups array

**updateSettings**:
- Merges partial settings updates

**getSettings**:
- Returns current settings

**Persistence**:
- Verify localStorage key 'timer-cloud-sync'

4. **Edge Cases**:
- Sync while already syncing (should handle gracefully)
- Backup with empty data
- Restore backup with missing mode sessions
- Auto-sync interval cleanup on unmount
</action>
<verify>Run `npm test src/components/timer/premium-history/cloud-sync/__tests__/syncStore.test.ts` - all tests pass</verify>
<done>syncStore has 25+ tests covering all sync operations, backup management, and settings with proper mocking</done>
</task>

<task type="auto">
<name>Create CloudSyncModal tests</name>
<files>src/components/timer/premium-history/cloud-sync/__tests__/CloudSyncModal.test.tsx</files>
<action>
Create tests for `CloudSyncModal` component:

1. **Setup**:
   - Mock useSyncStore
   - Mock tieredStorage.isLoggedIn
   - Use React Testing Library

2. **Test Groups**:

**Rendering**:
- Renders when open is true
- Does not render when open is false
- Shows sync status indicator

**Sync Status Display**:
- Shows "Never synced" when lastSyncTime is null
- Shows formatted date when lastSyncTime exists
- Shows "Syncing..." during sync
- Shows error message when syncError exists
- Shows pending changes count

**Sync Button**:
- Calls startSync when clicked
- Disabled during syncing
- Shows appropriate text based on state

**Login Required State**:
- Shows login prompt when not logged in
- Hides sync functionality when not logged in

**Settings Section**:
- Auto-sync toggle calls updateSettings
- Sync interval selector works
- Sync on login toggle works
- Backup before sync toggle works

**Backup Section**:
- Lists existing backups
- Create backup button works
- Restore backup button works (with confirmation)
- Delete backup button works (with confirmation)
- Shows backup metadata (date, device, size)

**Close Behavior**:
- onClose called when close button clicked
</action>
<verify>Run `npm test src/components/timer/premium-history/cloud-sync/__tests__/CloudSyncModal.test.tsx` - all tests pass</verify>
<done>CloudSyncModal has 18+ tests covering all UI states and interactions</done>
</task>

<task type="auto">
<name>Create SyncOnAuthChange tests</name>
<files>src/components/timer/premium-history/cloud-sync/__tests__/SyncOnAuthChange.test.tsx</files>
<action>
Create tests for `SyncOnAuthChange` component:

1. **Setup**:
   - Mock useSyncStore
   - Mock Supabase auth state listener
   - Mock tieredStorage

2. **Test Groups**:

**Auth State Changes**:
- Calls triggerSyncOnLogin when user signs in
- Does not call triggerSyncOnLogin on sign out
- Handles auth state change events correctly

**Cleanup**:
- Unsubscribes from auth listener on unmount

**Conditional Sync**:
- Respects syncOnLogin setting
- Respects autoSync setting

**Render**:
- Returns null (no visible UI)
- Does not affect children rendering

Note: This component may need to be examined first to understand its exact implementation. If it uses Supabase auth directly, mock `@supabase/supabase-js` or the auth context.
</action>
<verify>Run `npm test src/components/timer/premium-history/cloud-sync/__tests__/SyncOnAuthChange.test.tsx` - all tests pass</verify>
<done>SyncOnAuthChange has 8+ tests covering auth state changes and sync triggering</done>
</task>

## Success Criteria
- All three test files created
- 50+ total tests covering syncStore, CloudSyncModal, and SyncOnAuthChange
- All Supabase/tieredStorage dependencies properly mocked
- All tests pass

## Verification
```bash
npm test src/components/timer/premium-history/cloud-sync/__tests__/syncStore.test.ts
npm test src/components/timer/premium-history/cloud-sync/__tests__/CloudSyncModal.test.tsx
npm test src/components/timer/premium-history/cloud-sync/__tests__/SyncOnAuthChange.test.tsx
```
