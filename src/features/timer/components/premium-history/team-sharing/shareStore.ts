/**
 * Team Sharing Store
 * Manages shared sessions and team collaboration
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SharedSession, ShareLink, TeamMember } from './types'

interface ShareStore {
  sharedSessions: SharedSession[]
  shareLinks: ShareLink[]
  teamMembers: TeamMember[]
  
  // Share session
  shareSession: (sessionId: string, emails: string[], permissions: 'view' | 'comment' | 'edit', message?: string) => void
  unshareSession: (sharedSessionId: string) => void
  getSharedSessions: () => SharedSession[]
  
  // Share links
  createShareLink: (sessionIds: string[], expiresIn?: number, maxViews?: number, password?: string) => ShareLink
  deleteShareLink: (linkId: string) => void
  getShareLinks: () => ShareLink[]
  
  // Team members
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
  removeTeamMember: (memberId: string) => void
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => void
  getTeamMembers: () => TeamMember[]
}

export const useShareStore = create<ShareStore>()(
  persist(
    (set, get) => ({
      sharedSessions: [],
      shareLinks: [],
      teamMembers: [],

      shareSession: (sessionId, emails, permissions, message) => {
        const newShare: SharedSession = {
          id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          sharedWith: emails,
          sharedBy: 'current-user', // Would be actual user ID in production
          sharedAt: Date.now(),
          permissions,
          message,
        }
        set((state) => ({
          sharedSessions: [...state.sharedSessions, newShare],
        }))
      },

      unshareSession: (sharedSessionId) => {
        set((state) => ({
          sharedSessions: state.sharedSessions.filter((s) => s.id !== sharedSessionId),
        }))
      },

      getSharedSessions: () => {
        return get().sharedSessions
      },

      createShareLink: (sessionIds, expiresIn, maxViews, password) => {
        const linkId = Math.random().toString(36).substr(2, 9)
        const newLink: ShareLink = {
          id: linkId,
          url: `https://app.example.com/shared/${linkId}`,
          sessionIds,
          createdAt: Date.now(),
          expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
          viewCount: 0,
          maxViews,
          password,
        }
        set((state) => ({
          shareLinks: [...state.shareLinks, newLink],
        }))
        return newLink
      },

      deleteShareLink: (linkId) => {
        set((state) => ({
          shareLinks: state.shareLinks.filter((l) => l.id !== linkId),
        }))
      },

      getShareLinks: () => {
        return get().shareLinks
      },

      addTeamMember: (member) => {
        const newMember: TeamMember = {
          ...member,
          id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        set((state) => ({
          teamMembers: [...state.teamMembers, newMember],
        }))
      },

      removeTeamMember: (memberId) => {
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== memberId),
        }))
      },

      updateTeamMember: (memberId, updates) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === memberId ? { ...m, ...updates } : m
          ),
        }))
      },

      getTeamMembers: () => {
        return get().teamMembers
      },
    }),
    {
      name: 'timer-team-sharing',
    }
  )
)
