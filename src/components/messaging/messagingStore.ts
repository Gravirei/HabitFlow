/**
 * Messaging Store
 * Zustand store for conversations, messages, reactions, and real-time features
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Message,
  Conversation,
  MessageType,
  DeliveryStatus,
  TypingUser,
  HabitCardPayload,
  BadgeCardPayload,
  NudgeCardPayload,
  MessageReaction,
} from './types'
import { MESSAGING_LIMITS } from './constants'
import { useSocialStore } from '../social/socialStore'

// ─── Helper ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ─── State Interface ────────────────────────────────────────────────────────

interface MessagingState {
  // Conversations
  conversations: Conversation[]
  activeConversationId: string | null
  conversationFilter: 'all' | 'direct' | 'groups' | 'unread'

  // Messages
  messages: Record<string, Message[]>       // keyed by conversationId
  totalUnread: number

  // Real-time
  typingUsers: Record<string, TypingUser[]> // keyed by conversationId
  onlineUsers: Record<string, boolean>      // keyed by userId

  // Loading
  isLoadingMessages: boolean
  hasMoreMessages: Record<string, boolean>  // keyed by conversationId

  // UI
  shareTrayOpen: boolean

  // ─── Conversation Actions ────────────────────────────────────────────
  loadConversations: () => Promise<void>
  createDirectConversation: (friendId: string) => Promise<string>
  createGroupConversation: (name: string, memberIds: string[]) => Promise<string>
  setActiveConversation: (id: string | null) => void
  setConversationFilter: (filter: 'all' | 'direct' | 'groups' | 'unread') => void
  pinConversation: (id: string) => void
  muteConversation: (id: string) => void
  deleteConversation: (id: string) => void

  // ─── Message Actions ─────────────────────────────────────────────────
  loadMessages: (conversationId: string) => Promise<void>
  loadMoreMessages: (conversationId: string) => Promise<void>
  sendTextMessage: (conversationId: string, text: string) => Promise<void>
  sendHabitCard: (conversationId: string, habitId: string) => Promise<void>
  sendBadgeCard: (conversationId: string, badgeId: string) => Promise<void>
  sendNudgeMessage: (conversationId: string, userId: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  markConversationRead: (conversationId: string) => Promise<void>

  // ─── Reaction Actions ────────────────────────────────────────────────
  addReaction: (messageId: string, emoji: string) => Promise<void>
  removeReaction: (messageId: string, emoji: string) => Promise<void>

  // ─── Real-time Actions ───────────────────────────────────────────────
  subscribeToConversation: (conversationId: string) => void
  unsubscribeFromConversation: (conversationId: string) => void
  emitTyping: (conversationId: string) => void
  updateOnlineStatus: (userId: string, isOnline: boolean) => void

  // ─── Group Management Actions ────────────────────────────────────────
  updateGroupName: (conversationId: string, name: string) => Promise<void>
  addGroupMembers: (conversationId: string, userIds: string[]) => Promise<void>
  removeGroupMember: (conversationId: string, userId: string) => Promise<void>
  leaveGroup: (conversationId: string) => Promise<void>

  // ─── Unread Computation ──────────────────────────────────────────────
  recomputeUnread: () => void

  // ─── Share Tray ──────────────────────────────────────────────────────
  toggleShareTray: () => void

  // ─── Reset ───────────────────────────────────────────────────────────
  resetMessaging: () => void
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useMessagingStore = create<MessagingState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      activeConversationId: null,
      conversationFilter: 'all',
      messages: {},
      totalUnread: 0,
      typingUsers: {},
      onlineUsers: {},
      isLoadingMessages: false,
      hasMoreMessages: {},
      shareTrayOpen: false,

      // ─── Conversation Actions ──────────────────────────────────────────

      loadConversations: async () => {
        set({ isLoadingMessages: true })
        // TODO: Phase 3 — wire to Supabase
        set({ isLoadingMessages: false })
      },

      createDirectConversation: async (friendId) => {
        // Check if a direct conversation with this friendId already exists
        const existing = get().conversations.find(
          (c) =>
            c.type === 'direct' &&
            c.memberIds.includes(friendId) &&
            c.memberIds.includes('current-user')
        )
        if (existing) return existing.id

        // Look up friend from socialStore for display name
        const friend = useSocialStore
          .getState()
          .friends.find((f) => f.userId === friendId)

        const newId = generateId()
        const now = new Date().toISOString()

        const conversation: Conversation = {
          id: newId,
          type: 'direct',
          name: friend?.displayName ?? 'Unknown',
          memberIds: ['current-user', friendId],
          memberCount: 2,
          onlineCount: 0,
          createdBy: 'current-user',
          createdAt: now,
          updatedAt: now,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
        }

        set((state) => ({
          conversations: [...state.conversations, conversation],
          messages: { ...state.messages, [newId]: [] },
          hasMoreMessages: { ...state.hasMoreMessages, [newId]: false },
        }))

        return newId
      },

      createGroupConversation: async (name, memberIds) => {
        // Enforce max members
        const cappedMemberIds = memberIds.slice(
          0,
          MESSAGING_LIMITS.MAX_GROUP_MEMBERS
        )

        const newId = generateId()
        const now = new Date().toISOString()

        const conversation: Conversation = {
          id: newId,
          type: 'group',
          name,
          memberIds: ['current-user', ...cappedMemberIds],
          memberCount: 1 + cappedMemberIds.length,
          onlineCount: 0,
          createdBy: 'current-user',
          createdAt: now,
          updatedAt: now,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
        }

        set((state) => ({
          conversations: [...state.conversations, conversation],
          messages: { ...state.messages, [newId]: [] },
          hasMoreMessages: { ...state.hasMoreMessages, [newId]: false },
        }))

        return newId
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id })
        if (id !== null) {
          get().markConversationRead(id)
        }
      },

      setConversationFilter: (filter) => {
        set({ conversationFilter: filter })
      },

      pinConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        }))
      },

      muteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isMuted: !c.isMuted } : c
          ),
        }))
        get().recomputeUnread()
      },

      deleteConversation: (id) => {
        set((state) => {
          const { [id]: _removedMessages, ...remainingMessages } = state.messages
          const { [id]: _removedMore, ...remainingMore } = state.hasMoreMessages
          const { [id]: _removedTyping, ...remainingTyping } = state.typingUsers

          return {
            conversations: state.conversations.filter((c) => c.id !== id),
            messages: remainingMessages,
            hasMoreMessages: remainingMore,
            typingUsers: remainingTyping,
            activeConversationId:
              state.activeConversationId === id
                ? null
                : state.activeConversationId,
          }
        })
        get().recomputeUnread()
      },

      // ─── Message Actions ───────────────────────────────────────────────

      loadMessages: async (conversationId) => {
        set({ isLoadingMessages: true })
        // TODO: Phase 3 — wire to Supabase
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId] ?? [],
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: false,
          },
          isLoadingMessages: false,
        }))
      },

      loadMoreMessages: async (conversationId) => {
        if (!get().hasMoreMessages[conversationId] || get().isLoadingMessages)
          return
        // TODO: Phase 3 — wire to Supabase pagination
      },

      sendTextMessage: async (conversationId, text) => {
        if (text.trim() === '') return

        const now = new Date().toISOString()
        const messageId = generateId()

        const message: Message = {
          id: messageId,
          conversationId,
          senderId: 'current-user',
          senderName: 'You',
          senderAvatarUrl: '',
          type: 'text' as MessageType,
          text,
          reactions: [],
          deliveryStatus: 'sending' as DeliveryStatus,
          createdAt: now,
          isDeleted: false,
        }

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] ?? []),
              message,
            ],
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: message, updatedAt: now }
              : c
          ),
        }))

        // Simulate network latency — transition to 'sent'
        setTimeout(() => {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] ?? []).map(
                (m) =>
                  m.id === messageId
                    ? { ...m, deliveryStatus: 'sent' as DeliveryStatus }
                    : m
              ),
            },
          }))
        }, 100)
      },

      sendHabitCard: async (conversationId, habitId) => {
        const now = new Date().toISOString()
        const messageId = generateId()

        // Placeholder payload — will be enriched in Phase 5 when HabitShareCard reads from useHabitStore
        const habitCard: HabitCardPayload = {
          habitId,
          habitName: '',
          habitIcon: '',
          streakCount: 0,
          xpEarned: 0,
          completedAt: now,
        }

        const message: Message = {
          id: messageId,
          conversationId,
          senderId: 'current-user',
          senderName: 'You',
          senderAvatarUrl: '',
          type: 'habit_card' as MessageType,
          text: '',
          habitCard,
          reactions: [],
          deliveryStatus: 'sending' as DeliveryStatus,
          createdAt: now,
          isDeleted: false,
        }

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] ?? []),
              message,
            ],
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: message, updatedAt: now }
              : c
          ),
        }))

        // Simulate network latency — transition to 'sent'
        setTimeout(() => {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] ?? []).map(
                (m) =>
                  m.id === messageId
                    ? { ...m, deliveryStatus: 'sent' as DeliveryStatus }
                    : m
              ),
            },
          }))
        }, 100)
      },

      sendBadgeCard: async (conversationId, badgeId) => {
        const now = new Date().toISOString()
        const messageId = generateId()

        // Read badge data from socialStore
        const badges = useSocialStore.getState().badges
        const badge = badges.find((b) => b.id === badgeId)

        const badgeCard: BadgeCardPayload = {
          badgeId,
          badgeName: badge?.name ?? '',
          badgeIcon: badge?.icon ?? '',
          badgeRarity: badge?.rarity ?? 'common',
          badgeDescription: badge?.description ?? '',
          isLevelUp: false,
        }

        const message: Message = {
          id: messageId,
          conversationId,
          senderId: 'current-user',
          senderName: 'You',
          senderAvatarUrl: '',
          type: 'badge_card' as MessageType,
          text: badge?.name ?? '',
          badgeCard,
          reactions: [],
          deliveryStatus: 'sending' as DeliveryStatus,
          createdAt: now,
          isDeleted: false,
        }

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] ?? []),
              message,
            ],
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: message, updatedAt: now }
              : c
          ),
        }))

        // Simulate network latency — transition to 'sent'
        setTimeout(() => {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] ?? []).map(
                (m) =>
                  m.id === messageId
                    ? { ...m, deliveryStatus: 'sent' as DeliveryStatus }
                    : m
              ),
            },
          }))
        }, 100)
      },

      sendNudgeMessage: async (conversationId, userId) => {
        // CRITICAL: Delegate to socialStore — NEVER duplicate cooldown logic
        const canNudge = useSocialStore.getState().canNudge(userId)
        if (!canNudge) return

        // Register the nudge in socialStore
        useSocialStore.getState().sendNudge(userId)

        const now = new Date().toISOString()
        const messageId = generateId()

        const nudgeCard: NudgeCardPayload = {
          nudgeId: generateId(),
          message: 'Time to get back on track!',
          cooldownExpiry: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(),
        }

        const message: Message = {
          id: messageId,
          conversationId,
          senderId: 'current-user',
          senderName: 'You',
          senderAvatarUrl: '',
          type: 'nudge' as MessageType,
          text: 'Sent you a nudge!',
          nudgeCard,
          reactions: [],
          deliveryStatus: 'sending' as DeliveryStatus,
          createdAt: now,
          isDeleted: false,
        }

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] ?? []),
              message,
            ],
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: message, updatedAt: now }
              : c
          ),
        }))

        // Simulate network latency — transition to 'sent'
        setTimeout(() => {
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] ?? []).map(
                (m) =>
                  m.id === messageId
                    ? { ...m, deliveryStatus: 'sent' as DeliveryStatus }
                    : m
              ),
            },
          }))
        }, 100)
      },

      deleteMessage: async (messageId) => {
        const state = get()

        // Find which conversation contains this message
        let targetConversationId: string | null = null
        for (const [convId, msgs] of Object.entries(state.messages)) {
          if (msgs.some((m) => m.id === messageId)) {
            targetConversationId = convId
            break
          }
        }
        if (!targetConversationId) return

        const conversationId = targetConversationId
        const updatedMessages = (state.messages[conversationId] ?? []).filter(
          (m) => m.id !== messageId
        )
        const newLastMessage =
          updatedMessages.length > 0
            ? updatedMessages[updatedMessages.length - 1]
            : undefined

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: updatedMessages,
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: newLastMessage }
              : c
          ),
        }))
      },

      markConversationRead: async (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] ?? []).map((m) =>
              m.deliveryStatus === 'delivered'
                ? { ...m, deliveryStatus: 'read' as DeliveryStatus }
                : m
            ),
          },
        }))
        get().recomputeUnread()
      },

      // ─── Reaction Actions ──────────────────────────────────────────────

      addReaction: async (messageId, emoji) => {
        set((state) => {
          const newMessages = { ...state.messages }

          for (const convId of Object.keys(newMessages)) {
            const msgIndex = newMessages[convId].findIndex(
              (m) => m.id === messageId
            )
            if (msgIndex === -1) continue

            const msg = newMessages[convId][msgIndex]
            const existingReaction = msg.reactions.find(
              (r) => r.emoji === emoji
            )

            let updatedReactions: MessageReaction[]

            if (existingReaction) {
              // Guard: don't add duplicate
              if (existingReaction.userIds.includes('current-user')) return state

              updatedReactions = msg.reactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      userIds: [...r.userIds, 'current-user'],
                      hasCurrentUser: true,
                    }
                  : r
              )
            } else {
              updatedReactions = [
                ...msg.reactions,
                {
                  emoji,
                  count: 1,
                  userIds: ['current-user'],
                  hasCurrentUser: true,
                },
              ]
            }

            const updatedMsg = { ...msg, reactions: updatedReactions }
            newMessages[convId] = [
              ...newMessages[convId].slice(0, msgIndex),
              updatedMsg,
              ...newMessages[convId].slice(msgIndex + 1),
            ]

            return { messages: newMessages }
          }

          return state
        })
      },

      removeReaction: async (messageId, emoji) => {
        set((state) => {
          const newMessages = { ...state.messages }

          for (const convId of Object.keys(newMessages)) {
            const msgIndex = newMessages[convId].findIndex(
              (m) => m.id === messageId
            )
            if (msgIndex === -1) continue

            const msg = newMessages[convId][msgIndex]
            const existingReaction = msg.reactions.find(
              (r) => r.emoji === emoji
            )
            if (!existingReaction) return state

            let updatedReactions: MessageReaction[]

            if (existingReaction.count <= 1) {
              // Remove the entire reaction
              updatedReactions = msg.reactions.filter((r) => r.emoji !== emoji)
            } else {
              updatedReactions = msg.reactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count - 1,
                      userIds: r.userIds.filter((id) => id !== 'current-user'),
                      hasCurrentUser: false,
                    }
                  : r
              )
            }

            const updatedMsg = { ...msg, reactions: updatedReactions }
            newMessages[convId] = [
              ...newMessages[convId].slice(0, msgIndex),
              updatedMsg,
              ...newMessages[convId].slice(msgIndex + 1),
            ]

            return { messages: newMessages }
          }

          return state
        })
      },

      // ─── Real-time Actions ─────────────────────────────────────────────

      subscribeToConversation: (_conversationId) => {
        // TODO: Phase 3 — wire to realtimeService
      },

      unsubscribeFromConversation: (_conversationId) => {
        // TODO: Phase 3 — wire to realtimeService
      },

      emitTyping: (_conversationId) => {
        // TODO: Phase 3 — broadcast via Supabase Realtime
      },

      updateOnlineStatus: (userId, isOnline) => {
        set((state) => ({
          onlineUsers: { ...state.onlineUsers, [userId]: isOnline },
        }))
      },

      // ─── Group Management Actions ──────────────────────────────────────

      updateGroupName: async (conversationId, name) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId && c.type === 'group'
              ? { ...c, name }
              : c
          ),
        }))
      },

      addGroupMembers: async (conversationId, userIds) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId || c.type !== 'group') return c

            const existingIds = new Set(c.memberIds)
            const newIds = userIds.filter((id) => !existingIds.has(id))
            const availableSlots =
              MESSAGING_LIMITS.MAX_GROUP_MEMBERS - c.memberIds.length
            const idsToAdd = newIds.slice(0, Math.max(0, availableSlots))

            if (idsToAdd.length === 0) return c

            const updatedMemberIds = [...c.memberIds, ...idsToAdd]
            return {
              ...c,
              memberIds: updatedMemberIds,
              memberCount: updatedMemberIds.length,
            }
          }),
        }))
      },

      removeGroupMember: async (conversationId, userId) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId || c.type !== 'group') return c
            const updatedMemberIds = c.memberIds.filter((id) => id !== userId)
            return {
              ...c,
              memberIds: updatedMemberIds,
              memberCount: updatedMemberIds.length,
            }
          }),
        }))
      },

      leaveGroup: async (conversationId) => {
        set((state) => {
          const { [conversationId]: _removedMessages, ...remainingMessages } =
            state.messages
          const { [conversationId]: _removedMore, ...remainingMore } =
            state.hasMoreMessages
          const { [conversationId]: _removedTyping, ...remainingTyping } =
            state.typingUsers

          return {
            conversations: state.conversations.filter(
              (c) => c.id !== conversationId
            ),
            messages: remainingMessages,
            hasMoreMessages: remainingMore,
            typingUsers: remainingTyping,
            activeConversationId:
              state.activeConversationId === conversationId
                ? null
                : state.activeConversationId,
          }
        })
        get().recomputeUnread()
      },

      // ─── Unread Computation ────────────────────────────────────────────

      recomputeUnread: () => {
        const sum = get()
          .conversations.filter((c) => !c.isMuted)
          .reduce((acc, c) => acc + c.unreadCount, 0)
        set({ totalUnread: sum })
      },

      // ─── Share Tray ────────────────────────────────────────────────────

      toggleShareTray: () => {
        set((state) => ({ shareTrayOpen: !state.shareTrayOpen }))
      },

      // ─── Reset ─────────────────────────────────────────────────────────

      resetMessaging: () => {
        set({
          conversations: [],
          activeConversationId: null,
          conversationFilter: 'all',
          messages: {},
          totalUnread: 0,
          typingUsers: {},
          onlineUsers: {},
          isLoadingMessages: false,
          hasMoreMessages: {},
          shareTrayOpen: false,
        })
      },
    }),
    {
      name: 'messaging-store',
      version: 1,
    }
  )
)
