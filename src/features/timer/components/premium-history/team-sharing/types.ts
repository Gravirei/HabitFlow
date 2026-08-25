/**
 * Team Sharing Types
 */

export interface SharedSession {
  id: string
  sessionId: string
  sharedWith: string[] // Email addresses or user IDs
  sharedBy: string
  sharedAt: number
  permissions: 'view' | 'comment' | 'edit'
  expiresAt?: number
  message?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

export interface ShareLink {
  id: string
  url: string
  sessionIds: string[]
  createdAt: number
  expiresAt?: number
  viewCount: number
  maxViews?: number
  password?: string
}
