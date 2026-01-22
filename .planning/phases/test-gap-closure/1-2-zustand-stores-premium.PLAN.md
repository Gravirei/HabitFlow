# Plan: 1-2 - Zustand Stores Premium Features Tests (Tags, Archive, Notifications, Templates, Share)

## Objective
Create comprehensive unit tests for the premium feature Zustand stores: tagStore, archiveStore, notificationStore, templateStore, and shareStore.

## Context
- Test framework: Vitest with React Testing Library
- These stores manage premium/advanced features in the timer module
- All use Zustand persist middleware
- Pattern: See Plan 1-1 for established store testing patterns

## Dependencies
- None (Wave 1 - parallel with Plan 1-1)

## Tasks

<task type="auto">
<name>Create tagStore tests</name>
<files>src/components/timer/premium-history/custom-tags/__tests__/tagStore.test.ts</files>
<action>
Create comprehensive tests for `useTagStore`:

1. **Setup**:
   - Mock Date.now() for predictable IDs
   - Clear localStorage, reset store state

2. **Test Groups**:
   - **Initial State**: Empty tags and sessionTags arrays
   - **Tag Management**:
     - addTag: creates with generated ID, createdAt, usageCount: 0
     - updateTag: updates specified fields by ID
     - deleteTag: removes tag AND removes tagId from all sessionTags
     - getTag: finds by ID, returns undefined for missing
     - getAllTags: returns all tags
   - **Session Tagging**:
     - addTagToSession: 
       - Creates new sessionTags entry if none exists
       - Adds tagId to existing entry (no duplicates)
       - Increments tag usageCount
     - removeTagFromSession:
       - Removes tagId from session
       - Decrements tag usageCount (min 0)
     - getSessionTags: returns tagIds for session
     - getSessionsByTag: returns sessionIds that have tag
     - clearSessionTags: removes all tags from session
   - **Edge Cases**:
     - Adding same tag twice to session (should not duplicate)
     - Deleting tag that's used by sessions
     - Getting tags for non-existent session
   - **Persistence**: Verify localStorage key 'timer-custom-tags'
</action>
<verify>Run `npm test src/components/timer/premium-history/custom-tags/__tests__/tagStore.test.ts` - all tests pass</verify>
<done>tagStore has 15+ tests covering tag CRUD, session tagging, usage counts, and edge cases</done>
</task>

<task type="auto">
<name>Create archiveStore tests</name>
<files>src/components/timer/premium-history/archive/__tests__/archiveStore.test.ts</files>
<action>
Create comprehensive tests for `useArchiveStore`:

1. **Setup**:
   - Clear localStorage, reset store state
   - Create mock ArchivedSession objects for testing

2. **Test Groups**:
   - **Initial State**: Empty archivedSessions array
   - **Archive Operations**:
     - archiveSession: adds single session
     - archiveSessions/bulkArchive: adds multiple sessions
   - **Restore Operations**:
     - restoreSession: returns session and removes from archive
     - restoreSession with invalid ID: returns null
     - restoreSessions: returns multiple and removes from archive
   - **Delete Operations**:
     - deleteArchivedSession: removes single by ID
     - deleteArchivedSessions/bulkDelete: removes multiple
     - clearArchive: removes all
   - **Query Methods**:
     - getArchivedSession: find by ID
     - getArchivedByMode/filterByMode: filter by 'Stopwatch', 'Countdown', 'Intervals'
     - getArchivedByDateRange: filter by timestamp range
     - searchArchived/searchArchive: search by sessionName or mode (case-insensitive)
   - **Edge Cases**:
     - Restore non-existent session
     - Search with empty query
     - Date range with no matches
   - **Persistence**: Verify localStorage key 'timer-archive-storage'

3. **Mock Data Helper**:
```typescript
const createMockSession = (overrides = {}): ArchivedSession => ({
  id: `session-${Date.now()}`,
  mode: 'Stopwatch',
  timestamp: Date.now(),
  duration: 1800,
  archivedAt: Date.now(),
  originalStorage: 'stopwatch',
  ...overrides,
})
```
</action>
<verify>Run `npm test src/components/timer/premium-history/archive/__tests__/archiveStore.test.ts` - all tests pass</verify>
<done>archiveStore has 18+ tests covering archive, restore, delete, query operations, and search</done>
</task>

<task type="auto">
<name>Create notificationStore, templateStore, and shareStore tests</name>
<files>
src/components/timer/premium-history/notifications/__tests__/notificationStore.test.ts
src/components/timer/premium-history/session-templates/__tests__/templateStore.test.ts
src/components/timer/premium-history/team-sharing/__tests__/shareStore.test.ts
</files>
<action>
Create tests for the remaining three stores:

**notificationStore.test.ts**:
- Initial State: DEFAULT_SETTINGS, empty history, permissionGranted: false
- updateSettings: partial merge of settings
- resetSettings: restore to DEFAULT_SETTINGS
- setPermissionGranted: toggle permission state
- addToHistory: prepends entry, limits to 50
- clearHistory: empties history array
- getSettings: returns current settings
- enableSessionReminders/disableSessionReminders: toggle nested setting
- setQuietHours: updates quiet hours
- isQuietHours: correctly detects quiet hours (including overnight spans like 22:00-08:00)
- Persistence: 'timer-notification-settings'

**templateStore.test.ts**:
- Initial State: empty templates array
- addTemplate: creates with ID, createdAt, useCount: 0, isFavorite: false
- updateTemplate: updates specified fields
- deleteTemplate: removes by ID
- toggleFavorite: flips isFavorite boolean
- incrementUseCount: increases count and sets lastUsed
- getTemplate: finds by ID
- getFavorites: returns templates with isFavorite: true
- getRecentlyUsed: returns sorted by lastUsed, limited to param (default 5)
- Persistence: 'timer-session-templates'

**shareStore.test.ts**:
- Initial State: empty sharedSessions, shareLinks, teamMembers
- shareSession: creates SharedSession with ID, permissions, timestamp
- unshareSession: removes by ID
- getSharedSessions: returns all
- createShareLink: creates ShareLink with URL, optional expiry/maxViews/password
- deleteShareLink: removes by ID
- getShareLinks: returns all
- addTeamMember: creates with generated ID
- removeTeamMember: removes by ID
- updateTeamMember: updates fields
- getTeamMembers: returns all
- Persistence: 'timer-team-sharing'
</action>
<verify>
Run all three test files:
npm test src/components/timer/premium-history/notifications/__tests__/notificationStore.test.ts
npm test src/components/timer/premium-history/session-templates/__tests__/templateStore.test.ts
npm test src/components/timer/premium-history/team-sharing/__tests__/shareStore.test.ts
</verify>
<done>Three store test files created with 12+ tests each, covering all actions, getters, and edge cases</done>
</task>

## Success Criteria
- All five store test files created in appropriate `__tests__` directories
- 60+ total tests across the five stores
- All tests pass with `npm test`
- Tests cover all CRUD operations, getters, edge cases, and persistence

## Verification
```bash
npm test src/components/timer/premium-history/custom-tags/__tests__/tagStore.test.ts
npm test src/components/timer/premium-history/archive/__tests__/archiveStore.test.ts
npm test src/components/timer/premium-history/notifications/__tests__/notificationStore.test.ts
npm test src/components/timer/premium-history/session-templates/__tests__/templateStore.test.ts
npm test src/components/timer/premium-history/team-sharing/__tests__/shareStore.test.ts
```
