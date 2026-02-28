/**
 * Messaging System Types
 * Complete type definitions for conversations, messages, and real-time features
 */

import type { BadgeRarity } from '../social/types'

// ─── Message Types ──────────────────────────────────────────────────────────

export type MessageType = 'text' | 'habit_card' | 'badge_card' | 'xp_card' | 'nudge' | 'system'

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read'

export type ConversationType = 'direct' | 'group'

// ─── Card Payloads ──────────────────────────────────────────────────────────

export interface HabitCardPayload {
  habitId: string
  habitName: string
  habitIcon: string
  streakCount: number
  xpEarned: number
  completedAt: string // ISO string
}

export interface BadgeCardPayload {
  badgeId: string
  badgeName: string
  badgeIcon: string
  badgeRarity: BadgeRarity
  badgeDescription: string
  isLevelUp: boolean
  levelFrom?: number
  levelTo?: number
  xpEarned?: number
}

export interface NudgeCardPayload {
  nudgeId: string
  message: string
  cooldownExpiry: string // ISO string
}

// ─── Messages & Reactions ───────────────────────────────────────────────────

export interface MessageReaction {
  emoji: string
  count: number
  userIds: string[]
  hasCurrentUser: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatarUrl: string
  type: MessageType
  text?: string
  habitCard?: HabitCardPayload
  badgeCard?: BadgeCardPayload
  nudgeCard?: NudgeCardPayload
  reactions: MessageReaction[]
  deliveryStatus: DeliveryStatus
  deliveredAt?: string // ISO string
  readAt?: string // ISO string
  createdAt: string // ISO string
  isDeleted: boolean
}

// ─── Conversations ──────────────────────────────────────────────────────────

export interface Conversation {
  id: string
  type: ConversationType
  name: string
  avatarUrl?: string
  memberIds: string[]
  memberCount: number
  onlineCount: number
  lastMessage?: Message
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  isHidden?: boolean
  isArchived?: boolean
  createdBy: string
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

// ─── Presence & Typing ─────────────────────────────────────────────────────

export interface TypingUser {
  userId: string
  displayName: string
  startedAt: string // ISO string
}

export interface PresenceState {
  userId: string
  isOnline: boolean
  lastSeen: string // ISO string
}
