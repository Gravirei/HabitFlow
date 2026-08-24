/**
 * Share Store Tests
 * Comprehensive tests for team sharing Zustand store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'

// Must import store after mocks are set up
let useShareStore: typeof import('../shareStore').useShareStore

describe('useShareStore', () => {
  let mockDate = 1000000000000

  let mockRandom = 0.1

  beforeEach(async () => {
    mockDate = 1000000000000
    mockRandom = 0.1
    vi.spyOn(Date, 'now').mockImplementation(() => {
      mockDate += 1
      return mockDate
    })
    vi.spyOn(Math, 'random').mockImplementation(() => {
      mockRandom += 0.1
      return mockRandom
    })

    // Clear localStorage first
    localStorage.clear()
    
    // Dynamic import to ensure fresh store after localStorage is ready
    vi.resetModules()
    const module = await import('../shareStore')
    useShareStore = module.useShareStore

    // Reset store to initial state
    useShareStore.setState({
      sharedSessions: [],
      shareLinks: [],
      teamMembers: [],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty sharedSessions array', () => {
      const state = useShareStore.getState()
      expect(state.sharedSessions).toEqual([])
    })

    it('should start with empty shareLinks array', () => {
      const state = useShareStore.getState()
      expect(state.shareLinks).toEqual([])
    })

    it('should start with empty teamMembers array', () => {
      const state = useShareStore.getState()
      expect(state.teamMembers).toEqual([])
    })
  })

  describe('shareSession', () => {
    it('should share a session with one email', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user@example.com'], 'view')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions).toHaveLength(1)
      expect(state.sharedSessions[0].sessionId).toBe('session-1')
      expect(state.sharedSessions[0].sharedWith).toEqual(['user@example.com'])
      expect(state.sharedSessions[0].permissions).toBe('view')
    })

    it('should share a session with multiple emails', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession(
          'session-1',
          ['user1@example.com', 'user2@example.com', 'user3@example.com'],
          'edit'
        )
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions[0].sharedWith).toHaveLength(3)
    })

    it('should set correct permissions', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user@example.com'], 'view')
        shareSession('session-2', ['user@example.com'], 'comment')
        shareSession('session-3', ['user@example.com'], 'edit')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions[0].permissions).toBe('view')
      expect(state.sharedSessions[1].permissions).toBe('comment')
      expect(state.sharedSessions[2].permissions).toBe('edit')
    })

    it('should include optional message', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user@example.com'], 'view', 'Check out my progress!')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions[0].message).toBe('Check out my progress!')
    })

    it('should generate unique id and timestamp', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user@example.com'], 'view')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions[0].id).toMatch(/^share-/)
      expect(state.sharedSessions[0].sharedAt).toBeDefined()
      expect(state.sharedSessions[0].sharedBy).toBe('current-user')
    })

    it('should allow sharing same session multiple times', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user1@example.com'], 'view')
        shareSession('session-1', ['user2@example.com'], 'edit')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions).toHaveLength(2)
    })
  })

  describe('unshareSession', () => {
    it('should remove shared session by id', () => {
      const { shareSession, unshareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user@example.com'], 'view')
      })

      const shareId = useShareStore.getState().sharedSessions[0].id

      act(() => {
        unshareSession(shareId)
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions).toHaveLength(0)
    })

    it('should only remove specified share', () => {
      const { shareSession, unshareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user1@example.com'], 'view')
        shareSession('session-2', ['user2@example.com'], 'edit')
      })

      const shareId = useShareStore.getState().sharedSessions[0].id

      act(() => {
        unshareSession(shareId)
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions).toHaveLength(1)
      expect(state.sharedSessions[0].sessionId).toBe('session-2')
    })

    it('should handle unsharing non-existent share gracefully', () => {
      const { unshareSession } = useShareStore.getState()

      act(() => {
        unshareSession('non-existent')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions).toHaveLength(0)
    })
  })

  describe('getSharedSessions', () => {
    it('should return all shared sessions', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user@example.com'], 'view')
        shareSession('session-2', ['user@example.com'], 'edit')
      })

      const { getSharedSessions } = useShareStore.getState()
      const sessions = getSharedSessions()

      expect(sessions).toHaveLength(2)
    })

    it('should return empty array when no shares', () => {
      const { getSharedSessions } = useShareStore.getState()
      const sessions = getSharedSessions()

      expect(sessions).toEqual([])
    })
  })

  describe('createShareLink', () => {
    it('should create a share link for single session', () => {
      const { createShareLink } = useShareStore.getState()

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink(['session-1'])
      })

      expect(link!.id).toBeDefined()
      expect(link!.url).toContain('https://app.example.com/shared/')
      expect(link!.sessionIds).toEqual(['session-1'])
      expect(link!.viewCount).toBe(0)
    })

    it('should create a share link for multiple sessions', () => {
      const { createShareLink } = useShareStore.getState()

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink(['session-1', 'session-2', 'session-3'])
      })

      expect(link!.sessionIds).toHaveLength(3)
    })

    it('should set expiration time', () => {
      const { createShareLink } = useShareStore.getState()
      const expiresIn = 86400000 // 24 hours

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink(['session-1'], expiresIn)
      })

      expect(link!.expiresAt).toBeDefined()
      // expiresAt is createdAt + expiresIn, but Date.now() is called twice so there's a 1ms diff
      expect(link!.expiresAt! - link!.createdAt).toBeGreaterThanOrEqual(expiresIn)
      expect(link!.expiresAt! - link!.createdAt).toBeLessThanOrEqual(expiresIn + 10)
    })

    it('should set max views limit', () => {
      const { createShareLink } = useShareStore.getState()

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink(['session-1'], undefined, 10)
      })

      expect(link!.maxViews).toBe(10)
    })

    it('should set password protection', () => {
      const { createShareLink } = useShareStore.getState()

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink(['session-1'], undefined, undefined, 'secret123')
      })

      expect(link!.password).toBe('secret123')
    })

    it('should add link to shareLinks array', () => {
      const { createShareLink } = useShareStore.getState()

      act(() => {
        createShareLink(['session-1'])
      })

      const state = useShareStore.getState()
      expect(state.shareLinks).toHaveLength(1)
    })

    it('should create link with all options', () => {
      const { createShareLink } = useShareStore.getState()

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink(['session-1', 'session-2'], 3600000, 5, 'password')
      })

      expect(link!.sessionIds).toHaveLength(2)
      expect(link!.expiresAt).toBeDefined()
      expect(link!.maxViews).toBe(5)
      expect(link!.password).toBe('password')
    })
  })

  describe('deleteShareLink', () => {
    it('should delete a share link', () => {
      const { createShareLink, deleteShareLink } = useShareStore.getState()

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink(['session-1'])
      })

      act(() => {
        deleteShareLink(link!.id)
      })

      const state = useShareStore.getState()
      expect(state.shareLinks).toHaveLength(0)
    })

    it('should only delete specified link', () => {
      const { createShareLink, deleteShareLink } = useShareStore.getState()

      let link1: ReturnType<typeof createShareLink>
      act(() => {
        link1 = createShareLink(['session-1'])
        createShareLink(['session-2'])
      })

      act(() => {
        deleteShareLink(link1!.id)
      })

      const state = useShareStore.getState()
      expect(state.shareLinks).toHaveLength(1)
    })

    it('should handle deleting non-existent link gracefully', () => {
      const { deleteShareLink } = useShareStore.getState()

      act(() => {
        deleteShareLink('non-existent')
      })

      const state = useShareStore.getState()
      expect(state.shareLinks).toHaveLength(0)
    })
  })

  describe('getShareLinks', () => {
    it('should return all share links', () => {
      const { createShareLink } = useShareStore.getState()

      act(() => {
        createShareLink(['session-1'])
        createShareLink(['session-2'])
      })

      const { getShareLinks } = useShareStore.getState()
      const links = getShareLinks()

      expect(links).toHaveLength(2)
    })

    it('should return empty array when no links', () => {
      const { getShareLinks } = useShareStore.getState()
      const links = getShareLinks()

      expect(links).toEqual([])
    })
  })

  describe('addTeamMember', () => {
    it('should add a team member with generated id', () => {
      const { addTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({
          name: 'John Doe',
          email: 'john@example.com',
          role: 'member',
        })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers).toHaveLength(1)
      expect(state.teamMembers[0].name).toBe('John Doe')
      expect(state.teamMembers[0].email).toBe('john@example.com')
      expect(state.teamMembers[0].role).toBe('member')
      expect(state.teamMembers[0].id).toMatch(/^member-/)
    })

    it('should add member with avatar', () => {
      const { addTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'admin',
          avatar: 'https://example.com/avatar.jpg',
        })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers[0].avatar).toBe('https://example.com/avatar.jpg')
    })

    it('should add members with different roles', () => {
      const { addTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'Owner', email: 'owner@example.com', role: 'owner' })
        addTeamMember({ name: 'Admin', email: 'admin@example.com', role: 'admin' })
        addTeamMember({ name: 'Member', email: 'member@example.com', role: 'member' })
        addTeamMember({ name: 'Viewer', email: 'viewer@example.com', role: 'viewer' })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers).toHaveLength(4)
      expect(state.teamMembers.map(m => m.role)).toEqual(['owner', 'admin', 'member', 'viewer'])
    })
  })

  describe('removeTeamMember', () => {
    it('should remove a team member', () => {
      const { addTeamMember, removeTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'John', email: 'john@example.com', role: 'member' })
      })

      const memberId = useShareStore.getState().teamMembers[0].id

      act(() => {
        removeTeamMember(memberId)
      })

      const state = useShareStore.getState()
      expect(state.teamMembers).toHaveLength(0)
    })

    it('should only remove specified member', () => {
      const { addTeamMember, removeTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'John', email: 'john@example.com', role: 'member' })
        addTeamMember({ name: 'Jane', email: 'jane@example.com', role: 'admin' })
      })

      const memberId = useShareStore.getState().teamMembers[0].id

      act(() => {
        removeTeamMember(memberId)
      })

      const state = useShareStore.getState()
      expect(state.teamMembers).toHaveLength(1)
      expect(state.teamMembers[0].name).toBe('Jane')
    })

    it('should handle removing non-existent member gracefully', () => {
      const { removeTeamMember } = useShareStore.getState()

      act(() => {
        removeTeamMember('non-existent')
      })

      const state = useShareStore.getState()
      expect(state.teamMembers).toHaveLength(0)
    })
  })

  describe('updateTeamMember', () => {
    it('should update member name', () => {
      const { addTeamMember, updateTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'John', email: 'john@example.com', role: 'member' })
      })

      const memberId = useShareStore.getState().teamMembers[0].id

      act(() => {
        updateTeamMember(memberId, { name: 'John Doe' })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers[0].name).toBe('John Doe')
    })

    it('should update member role', () => {
      const { addTeamMember, updateTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'John', email: 'john@example.com', role: 'member' })
      })

      const memberId = useShareStore.getState().teamMembers[0].id

      act(() => {
        updateTeamMember(memberId, { role: 'admin' })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers[0].role).toBe('admin')
    })

    it('should update multiple fields', () => {
      const { addTeamMember, updateTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'John', email: 'john@example.com', role: 'member' })
      })

      const memberId = useShareStore.getState().teamMembers[0].id

      act(() => {
        updateTeamMember(memberId, {
          name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'admin',
          avatar: 'https://example.com/new-avatar.jpg',
        })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers[0].name).toBe('John Smith')
      expect(state.teamMembers[0].email).toBe('john.smith@example.com')
      expect(state.teamMembers[0].role).toBe('admin')
      expect(state.teamMembers[0].avatar).toBe('https://example.com/new-avatar.jpg')
    })

    it('should not affect other members', () => {
      const { addTeamMember, updateTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'John', email: 'john@example.com', role: 'member' })
        addTeamMember({ name: 'Jane', email: 'jane@example.com', role: 'member' })
      })

      const memberId = useShareStore.getState().teamMembers[0].id

      act(() => {
        updateTeamMember(memberId, { name: 'John Updated' })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers[1].name).toBe('Jane')
    })

    it('should handle updating non-existent member gracefully', () => {
      const { updateTeamMember } = useShareStore.getState()

      act(() => {
        updateTeamMember('non-existent', { name: 'Test' })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers).toHaveLength(0)
    })
  })

  describe('getTeamMembers', () => {
    it('should return all team members', () => {
      const { addTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({ name: 'John', email: 'john@example.com', role: 'member' })
        addTeamMember({ name: 'Jane', email: 'jane@example.com', role: 'admin' })
      })

      const { getTeamMembers } = useShareStore.getState()
      const members = getTeamMembers()

      expect(members).toHaveLength(2)
    })

    it('should return empty array when no members', () => {
      const { getTeamMembers } = useShareStore.getState()
      const members = getTeamMembers()

      expect(members).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty email array in shareSession', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', [], 'view')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions[0].sharedWith).toEqual([])
    })

    it('should handle special characters in message', () => {
      const { shareSession } = useShareStore.getState()

      act(() => {
        shareSession('session-1', ['user@example.com'], 'view', '🎉 Check this out! <script>alert("hi")</script>')
      })

      const state = useShareStore.getState()
      expect(state.sharedSessions[0].message).toBe('🎉 Check this out! <script>alert("hi")</script>')
    })

    it('should handle empty session ids array in createShareLink', () => {
      const { createShareLink } = useShareStore.getState()

      let link: ReturnType<typeof createShareLink>
      act(() => {
        link = createShareLink([])
      })

      expect(link!.sessionIds).toEqual([])
    })

    it('should handle special characters in team member name', () => {
      const { addTeamMember } = useShareStore.getState()

      act(() => {
        addTeamMember({
          name: "José García O'Brien",
          email: 'jose@example.com',
          role: 'member',
        })
      })

      const state = useShareStore.getState()
      expect(state.teamMembers[0].name).toBe("José García O'Brien")
    })
  })
})
