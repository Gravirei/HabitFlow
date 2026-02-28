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
  PresenceState,
  HabitCardPayload,
  BadgeCardPayload,
  NudgeCardPayload,
  MessageReaction,
} from './types'
import { MESSAGING_LIMITS } from './constants'
import { useSocialStore } from '../social/socialStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useProfileStore } from '@/store/useProfileStore'
import {
  subscribeToConversation as rtSubscribe,
  subscribeToTyping,
  subscribeToPresence,
  sendTypingIndicator,
  unsubscribeFromConversation as rtUnsubscribe,
  unsubscribeAll,
} from './realtimeService'

// ─── Helper ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ─── Dummy Data (for UI preview — remove before production) ─────────────────

const DUMMY_USERS = {
  alex: { id: 'user-alex', name: 'Alex Chen', avatar: '/images/avatars/avatar1.jpg' },
  sarah: { id: 'user-sarah', name: 'Sarah Kim', avatar: '/images/avatars/avatar2.jpg' },
  mike: { id: 'user-mike', name: 'Mike Johnson', avatar: '/images/avatars/avatar3.jpg' },
  emma: { id: 'user-emma', name: 'Emma Davis', avatar: '/images/avatars/avatar4.jpg' },
  jay: { id: 'user-jay', name: 'Jay Patel', avatar: '/images/avatars/avatar5.jpg' },
}

const now = new Date()
const mins = (n: number) => new Date(now.getTime() - n * 60000).toISOString()
const hours = (n: number) => new Date(now.getTime() - n * 3600000).toISOString()

const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    name: 'Alex Chen',
    avatarUrl: DUMMY_USERS.alex.avatar,
    memberIds: ['current-user', DUMMY_USERS.alex.id],
    memberCount: 2,
    onlineCount: 1,
    createdBy: 'current-user',
    createdAt: hours(48),
    updatedAt: mins(2),
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    lastMessage: {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      senderId: DUMMY_USERS.alex.id,
      senderName: 'Alex Chen',
      senderAvatarUrl: DUMMY_USERS.alex.avatar,
      type: 'text',
      text: 'Just finished my morning workout! 💪 Are you keeping up with yours?',
      reactions: [],
      deliveryStatus: 'delivered',
      createdAt: mins(2),
      isDeleted: false,
    },
  },
  {
    id: 'conv-2',
    type: 'direct',
    name: 'Sarah Kim',
    avatarUrl: DUMMY_USERS.sarah.avatar,
    memberIds: ['current-user', DUMMY_USERS.sarah.id],
    memberCount: 2,
    onlineCount: 1,
    createdBy: DUMMY_USERS.sarah.id,
    createdAt: hours(72),
    updatedAt: mins(45),
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    lastMessage: {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      senderId: DUMMY_USERS.sarah.id,
      senderName: 'Sarah Kim',
      senderAvatarUrl: DUMMY_USERS.sarah.avatar,
      type: 'nudge',
      text: 'Sent you a nudge!',
      nudgeCard: { nudgeId: 'nudge-1', message: 'Time to get back on track!', cooldownExpiry: hours(-23) },
      reactions: [],
      deliveryStatus: 'delivered',
      createdAt: mins(45),
      isDeleted: false,
    },
  },
  {
    id: 'conv-3',
    type: 'group',
    name: 'Morning Accountability',
    memberIds: ['current-user', DUMMY_USERS.alex.id, DUMMY_USERS.sarah.id, DUMMY_USERS.mike.id, DUMMY_USERS.emma.id],
    memberCount: 5,
    onlineCount: 3,
    createdBy: 'current-user',
    createdAt: hours(120),
    updatedAt: hours(1),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessage: {
      id: 'msg-3-4',
      conversationId: 'conv-3',
      senderId: DUMMY_USERS.mike.id,
      senderName: 'Mike Johnson',
      senderAvatarUrl: DUMMY_USERS.mike.avatar,
      type: 'habit_card',
      text: '',
      habitCard: { habitId: 'h-1', habitName: 'Meditation', habitIcon: 'self_improvement', streakCount: 14, xpEarned: 50, completedAt: hours(1) },
      reactions: [{ emoji: '🔥', count: 3, userIds: ['current-user', DUMMY_USERS.alex.id, DUMMY_USERS.emma.id], hasCurrentUser: true }],
      deliveryStatus: 'read',
      createdAt: hours(1),
      isDeleted: false,
    },
  },
  {
    id: 'conv-4',
    type: 'direct',
    name: 'Mike Johnson',
    avatarUrl: DUMMY_USERS.mike.avatar,
    memberIds: ['current-user', DUMMY_USERS.mike.id],
    memberCount: 2,
    onlineCount: 0,
    createdBy: 'current-user',
    createdAt: hours(24),
    updatedAt: hours(3),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessage: {
      id: 'msg-4-2',
      conversationId: 'conv-4',
      senderId: 'current-user',
      senderName: 'You',
      senderAvatarUrl: '',
      type: 'text',
      text: 'See you at the gym tomorrow!',
      reactions: [],
      deliveryStatus: 'read',
      createdAt: hours(3),
      isDeleted: false,
    },
  },
  {
    id: 'conv-5',
    type: 'direct',
    name: 'Emma Davis',
    avatarUrl: DUMMY_USERS.emma.avatar,
    memberIds: ['current-user', DUMMY_USERS.emma.id],
    memberCount: 2,
    onlineCount: 0,
    createdBy: DUMMY_USERS.emma.id,
    createdAt: hours(96),
    updatedAt: hours(18),
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    lastMessage: {
      id: 'msg-5-1',
      conversationId: 'conv-5',
      senderId: 'current-user',
      senderName: 'You',
      senderAvatarUrl: '',
      type: 'badge_card',
      text: 'Early Bird',
      badgeCard: { badgeId: 'b-1', badgeName: 'Early Bird', badgeIcon: 'wb_sunny', badgeRarity: 'rare', badgeDescription: 'Complete a habit before 7am for 7 days', isLevelUp: false },
      reactions: [{ emoji: '👏', count: 1, userIds: [DUMMY_USERS.emma.id], hasCurrentUser: false }],
      deliveryStatus: 'read',
      createdAt: hours(18),
      isDeleted: false,
    },
  },
  {
    id: 'conv-6',
    type: 'group',
    name: 'Study Squad',
    memberIds: ['current-user', DUMMY_USERS.jay.id, DUMMY_USERS.sarah.id],
    memberCount: 3,
    onlineCount: 1,
    createdBy: DUMMY_USERS.jay.id,
    createdAt: hours(200),
    updatedAt: hours(26),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessage: {
      id: 'msg-6-1',
      conversationId: 'conv-6',
      senderId: DUMMY_USERS.jay.id,
      senderName: 'Jay Patel',
      senderAvatarUrl: DUMMY_USERS.jay.avatar,
      type: 'text',
      text: 'Great session today everyone! Let\'s keep the streak going 🎯',
      reactions: [],
      deliveryStatus: 'read',
      createdAt: hours(26),
      isDeleted: false,
    },
  },
]

const DUMMY_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1', conversationId: 'conv-1', senderId: 'current-user', senderName: 'You', senderAvatarUrl: '',
      type: 'text', text: 'Hey Alex! How\'s the new habit plan going?', reactions: [],
      deliveryStatus: 'read', createdAt: hours(2), isDeleted: false,
    },
    {
      id: 'msg-1-2', conversationId: 'conv-1', senderId: DUMMY_USERS.alex.id, senderName: 'Alex Chen', senderAvatarUrl: DUMMY_USERS.alex.avatar,
      type: 'text', text: 'Going great! I\'ve been sticking to it for 5 days now.', reactions: [{ emoji: '🔥', count: 1, userIds: ['current-user'], hasCurrentUser: true }],
      deliveryStatus: 'read', createdAt: hours(2) + '1', isDeleted: false,
    },
    {
      id: 'msg-1-3', conversationId: 'conv-1', senderId: DUMMY_USERS.alex.id, senderName: 'Alex Chen', senderAvatarUrl: DUMMY_USERS.alex.avatar,
      type: 'habit_card', text: '',
      habitCard: { habitId: 'h-2', habitName: 'Read 30 minutes', habitIcon: 'menu_book', streakCount: 5, xpEarned: 35, completedAt: hours(1.5) },
      reactions: [{ emoji: '👏', count: 1, userIds: ['current-user'], hasCurrentUser: true }, { emoji: '⭐', count: 1, userIds: ['current-user'], hasCurrentUser: true }],
      deliveryStatus: 'read', createdAt: mins(90), isDeleted: false,
    },
    {
      id: 'msg-1-4', conversationId: 'conv-1', senderId: 'current-user', senderName: 'You', senderAvatarUrl: '',
      type: 'text', text: 'That\'s amazing! Keep it up! 🙌',
      reactions: [], deliveryStatus: 'read', createdAt: mins(30), isDeleted: false,
    },
    {
      id: 'msg-1-5', conversationId: 'conv-1', senderId: DUMMY_USERS.alex.id, senderName: 'Alex Chen', senderAvatarUrl: DUMMY_USERS.alex.avatar,
      type: 'text', text: 'Just finished my morning workout! 💪 Are you keeping up with yours?',
      reactions: [], deliveryStatus: 'delivered', createdAt: mins(2), isDeleted: false,
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1', conversationId: 'conv-2', senderId: 'current-user', senderName: 'You', senderAvatarUrl: '',
      type: 'text', text: 'Hi Sarah! Want to be accountability partners?',
      reactions: [], deliveryStatus: 'read', createdAt: hours(5), isDeleted: false,
    },
    {
      id: 'msg-2-2', conversationId: 'conv-2', senderId: DUMMY_USERS.sarah.id, senderName: 'Sarah Kim', senderAvatarUrl: DUMMY_USERS.sarah.avatar,
      type: 'badge_card', text: 'Consistency Champion',
      badgeCard: { badgeId: 'b-2', badgeName: 'Consistency Champion', badgeIcon: 'emoji_events', badgeRarity: 'epic', badgeDescription: 'Maintain a 30-day streak', isLevelUp: true, levelFrom: 4, levelTo: 5, xpEarned: 200 },
      reactions: [{ emoji: '🔥', count: 1, userIds: ['current-user'], hasCurrentUser: true }, { emoji: '🙌', count: 1, userIds: ['current-user'], hasCurrentUser: true }],
      deliveryStatus: 'read', createdAt: hours(3), isDeleted: false,
    },
    {
      id: 'msg-2-3', conversationId: 'conv-2', senderId: DUMMY_USERS.sarah.id, senderName: 'Sarah Kim', senderAvatarUrl: DUMMY_USERS.sarah.avatar,
      type: 'nudge', text: 'Sent you a nudge!',
      nudgeCard: { nudgeId: 'nudge-1', message: 'Time to get back on track!', cooldownExpiry: hours(-23) },
      reactions: [], deliveryStatus: 'delivered', createdAt: mins(45), isDeleted: false,
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1', conversationId: 'conv-3', senderId: DUMMY_USERS.emma.id, senderName: 'Emma Davis', senderAvatarUrl: DUMMY_USERS.emma.avatar,
      type: 'text', text: 'Good morning everyone! Who\'s done their morning routine?',
      reactions: [], deliveryStatus: 'read', createdAt: hours(3), isDeleted: false,
    },
    {
      id: 'msg-3-2', conversationId: 'conv-3', senderId: 'current-user', senderName: 'You', senderAvatarUrl: '',
      type: 'text', text: 'Already done! ✅ Meditation + journaling',
      reactions: [{ emoji: '🔥', count: 2, userIds: [DUMMY_USERS.alex.id, DUMMY_USERS.emma.id], hasCurrentUser: false }],
      deliveryStatus: 'read', createdAt: hours(2.5), isDeleted: false,
    },
    {
      id: 'msg-3-3', conversationId: 'conv-3', senderId: DUMMY_USERS.alex.id, senderName: 'Alex Chen', senderAvatarUrl: DUMMY_USERS.alex.avatar,
      type: 'text', text: 'Nice! I just finished my yoga session',
      reactions: [], deliveryStatus: 'read', createdAt: hours(2), isDeleted: false,
    },
    {
      id: 'msg-3-4', conversationId: 'conv-3', senderId: DUMMY_USERS.mike.id, senderName: 'Mike Johnson', senderAvatarUrl: DUMMY_USERS.mike.avatar,
      type: 'habit_card', text: '',
      habitCard: { habitId: 'h-1', habitName: 'Meditation', habitIcon: 'self_improvement', streakCount: 14, xpEarned: 50, completedAt: hours(1) },
      reactions: [{ emoji: '🔥', count: 3, userIds: ['current-user', DUMMY_USERS.alex.id, DUMMY_USERS.emma.id], hasCurrentUser: true }],
      deliveryStatus: 'read', createdAt: hours(1), isDeleted: false,
    },
  ],
  'conv-4': [
    {
      id: 'msg-4-1', conversationId: 'conv-4', senderId: DUMMY_USERS.mike.id, senderName: 'Mike Johnson', senderAvatarUrl: DUMMY_USERS.mike.avatar,
      type: 'text', text: 'Want to hit the gym together tomorrow?',
      reactions: [], deliveryStatus: 'read', createdAt: hours(4), isDeleted: false,
    },
    {
      id: 'msg-4-2', conversationId: 'conv-4', senderId: 'current-user', senderName: 'You', senderAvatarUrl: '',
      type: 'text', text: 'See you at the gym tomorrow!',
      reactions: [{ emoji: '💪', count: 1, userIds: [DUMMY_USERS.mike.id], hasCurrentUser: false }],
      deliveryStatus: 'read', createdAt: hours(3), isDeleted: false,
    },
  ],
  'conv-5': [
    {
      id: 'msg-5-1', conversationId: 'conv-5', senderId: 'current-user', senderName: 'You', senderAvatarUrl: '',
      type: 'badge_card', text: 'Early Bird',
      badgeCard: { badgeId: 'b-1', badgeName: 'Early Bird', badgeIcon: 'wb_sunny', badgeRarity: 'rare', badgeDescription: 'Complete a habit before 7am for 7 days', isLevelUp: false },
      reactions: [{ emoji: '👏', count: 1, userIds: [DUMMY_USERS.emma.id], hasCurrentUser: false }],
      deliveryStatus: 'read', createdAt: hours(18), isDeleted: false,
    },
  ],
  'conv-6': [
    {
      id: 'msg-6-1', conversationId: 'conv-6', senderId: DUMMY_USERS.jay.id, senderName: 'Jay Patel', senderAvatarUrl: DUMMY_USERS.jay.avatar,
      type: 'text', text: 'Great session today everyone! Let\'s keep the streak going 🎯',
      reactions: [{ emoji: '🎯', count: 2, userIds: ['current-user', DUMMY_USERS.sarah.id], hasCurrentUser: true }],
      deliveryStatus: 'read', createdAt: hours(26), isDeleted: false,
    },
  ],
}

const DUMMY_ONLINE: Record<string, boolean> = {
  [DUMMY_USERS.alex.id]: true,
  [DUMMY_USERS.sarah.id]: true,
  [DUMMY_USERS.mike.id]: false,
  [DUMMY_USERS.emma.id]: false,
  [DUMMY_USERS.jay.id]: true,
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
  currentUserId: string | null

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
  markConversationUnread: (id: string) => void
  hideConversation: (id: string) => void
  archiveConversation: (id: string) => void

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

  // ─── Real-time Callback Actions ──────────────────────────────────────
  onMessageReceived: (conversationId: string, message: Message) => void
  onStatusUpdate: (conversationId: string, messageId: string, status: DeliveryStatus) => void
  onTypingUpdate: (conversationId: string, user: TypingUser, isTyping: boolean) => void
  onPresenceSync: (conversationId: string, presenceStates: PresenceState[]) => void

  // ─── Real-time Lifecycle Actions ───────────────────────────────────────
  startRealtimeForConversation: (conversationId: string) => void
  stopRealtimeForConversation: (conversationId: string) => void
  stopAllRealtime: () => void

  // ─── Typing Send Action ────────────────────────────────────────────────
  sendTyping: (conversationId: string, isTyping: boolean) => void

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
      // Initial state — dummy data is only used when localStorage has no persisted state
      // (i.e. first launch / cleared storage). Once persisted, partialize controls what's saved.
      conversations: DUMMY_CONVERSATIONS,
      activeConversationId: null,
      conversationFilter: 'all',
      messages: DUMMY_MESSAGES,
      totalUnread: 4,
      typingUsers: {},
      onlineUsers: DUMMY_ONLINE,
      currentUserId: 'current-user',
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
        const { currentUserId } = get()
        const myId = currentUserId ?? 'current-user'

        // Check if a direct conversation with this friendId already exists
        const existing = get().conversations.find(
          (c) =>
            c.type === 'direct' &&
            c.memberIds.includes(friendId) &&
            c.memberIds.includes(myId)
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
          memberIds: [myId, friendId],
          memberCount: 2,
          onlineCount: 0,
          createdBy: myId,
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
        const myId = get().currentUserId ?? 'current-user'

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
          memberIds: [myId, ...cappedMemberIds],
          memberCount: 1 + cappedMemberIds.length,
          onlineCount: 0,
          createdBy: myId,
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

      markConversationUnread: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: c.unreadCount > 0 ? 0 : 1 } : c
          ),
        }))
        get().recomputeUnread()
      },

      hideConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isHidden: true } : c
          ),
        }))
      },

      archiveConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isArchived: true } : c
          ),
        }))
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
        const { currentUserId } = get()
        const myId = currentUserId ?? 'current-user'
        const profile = useProfileStore.getState()
        const myName = profile.fullName || profile.username || 'You'
        const myAvatar = profile.avatarUrl ?? ''

        const message: Message = {
          id: messageId,
          conversationId,
          senderId: myId,
          senderName: myName,
          senderAvatarUrl: myAvatar,
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
        const { currentUserId } = get()
        const myId = currentUserId ?? 'current-user'
        const profile = useProfileStore.getState()
        const myName = profile.fullName || profile.username || 'You'
        const myAvatar = profile.avatarUrl ?? ''

        // Read habit data from useHabitStore
        const habit = useHabitStore.getState().habits.find((h) => h.id === habitId)
        const habitCard: HabitCardPayload = {
          habitId,
          habitName: habit?.name ?? '',
          habitIcon: habit?.icon ?? '',
          streakCount: habit?.currentStreak ?? 0,
          xpEarned: (habit?.currentStreak ?? 0) * 10,
          completedAt: now,
        }

        const message: Message = {
          id: messageId,
          conversationId,
          senderId: myId,
          senderName: myName,
          senderAvatarUrl: myAvatar,
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
        const { currentUserId } = get()
        const myId = currentUserId ?? 'current-user'
        const profile = useProfileStore.getState()
        const myName = profile.fullName || profile.username || 'You'
        const myAvatar = profile.avatarUrl ?? ''

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
          senderId: myId,
          senderName: myName,
          senderAvatarUrl: myAvatar,
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

        // Register the nudge in socialStore (once — caller must NOT call sendNudge separately)
        useSocialStore.getState().sendNudge(userId)

        const now = new Date().toISOString()
        const messageId = generateId()
        const { currentUserId } = get()
        const myId = currentUserId ?? 'current-user'
        const profile = useProfileStore.getState()
        const myName = profile.fullName || profile.username || 'You'
        const myAvatar = profile.avatarUrl ?? ''

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
          senderId: myId,
          senderName: myName,
          senderAvatarUrl: myAvatar,
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
        // Find which conversation contains this message
        let targetConversationId: string | null = null
        for (const [convId, msgs] of Object.entries(get().messages)) {
          if (msgs.some((m) => m.id === messageId)) {
            targetConversationId = convId
            break
          }
        }
        if (!targetConversationId) return

        const conversationId = targetConversationId

        // Soft-delete: mark isDeleted=true so MessageBubble can show a placeholder.
        // Hard removal would break conversation history and reply threading.
        set((state) => {
          const updatedMessages = (state.messages[conversationId] ?? []).map(
            (m) => m.id === messageId ? { ...m, isDeleted: true } : m
          )
          // Update lastMessage only if the deleted message was the last one
          const lastVisible = [...updatedMessages]
            .reverse()
            .find((m) => !m.isDeleted)

          return {
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages,
            },
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, lastMessage: lastVisible }
                : c
            ),
          }
        })
      },

      markConversationRead: async (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] ?? []).map((m) =>
              // Upgrade both 'sent' and 'delivered' to 'read'
              m.deliveryStatus === 'delivered' || m.deliveryStatus === 'sent'
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

      // ─── Real-time Callback Actions ─────────────────────────────────────

      onMessageReceived: (conversationId, message) => {
        set((state) => {
          const existingMessages = state.messages[conversationId] ?? []
          const updatedMessages = [...existingMessages, message]

          // Update conversation: lastMessage, updatedAt, unread
          const isFromOther = message.senderId !== state.currentUserId
          const updatedConversations = state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                  unreadCount: isFromOther ? c.unreadCount + 1 : c.unreadCount,
                }
              : c
          )

          // Move conversation to top (most recent first)
          const convIndex = updatedConversations.findIndex((c) => c.id === conversationId)
          if (convIndex > 0) {
            const [conv] = updatedConversations.splice(convIndex, 1)
            updatedConversations.unshift(conv)
          }

          return {
            messages: { ...state.messages, [conversationId]: updatedMessages },
            conversations: updatedConversations,
            totalUnread: isFromOther ? state.totalUnread + 1 : state.totalUnread,
          }
        })
      },

      onStatusUpdate: (conversationId, messageId, status) => {
        const statusPriority: Record<DeliveryStatus, number> = {
          sending: 0,
          sent: 1,
          delivered: 2,
          read: 3,
        }

        set((state) => {
          const msgs = state.messages[conversationId]
          if (!msgs) return state

          const msgIndex = msgs.findIndex((m) => m.id === messageId)
          if (msgIndex === -1) return state

          const existing = msgs[msgIndex]
          // Only upgrade status, never downgrade
          if (statusPriority[status] <= statusPriority[existing.deliveryStatus]) {
            return state
          }

          const updatedMessages = [...msgs]
          updatedMessages[msgIndex] = { ...existing, deliveryStatus: status }

          return {
            messages: { ...state.messages, [conversationId]: updatedMessages },
          }
        })
      },

      onTypingUpdate: (conversationId, user, isTyping) => {
        set((state) => {
          const current = state.typingUsers[conversationId] ?? []

          if (isTyping) {
            // Add user if not already present
            const alreadyTyping = current.some((u) => u.userId === user.userId)
            if (alreadyTyping) return state

            return {
              typingUsers: {
                ...state.typingUsers,
                [conversationId]: [...current, user],
              },
            }
          } else {
            // Remove user
            const filtered = current.filter((u) => u.userId !== user.userId)
            if (filtered.length === current.length) return state

            const updatedTyping = { ...state.typingUsers }
            if (filtered.length === 0) {
              delete updatedTyping[conversationId]
            } else {
              updatedTyping[conversationId] = filtered
            }

            return { typingUsers: updatedTyping }
          }
        })
      },

      onPresenceSync: (conversationId, presenceStates) => {
        set((state) => {
          const updatedOnline = { ...state.onlineUsers }
          for (const ps of presenceStates) {
            updatedOnline[ps.userId] = ps.isOnline
          }

          // Update conversation online count
          const updatedConversations = state.conversations.map((c) => {
            if (c.id !== conversationId) return c
            const onlineCount = c.memberIds.filter((id) => updatedOnline[id]).length
            return { ...c, onlineCount }
          })

          return {
            onlineUsers: updatedOnline,
            conversations: updatedConversations,
          }
        })

        // Cross-sync with socialStore: update Friend.status
        const socialState = useSocialStore.getState()
        let needsUpdate = false

        const updatedFriends = socialState.friends.map((friend) => {
          const presence = presenceStates.find((ps) => ps.userId === friend.userId)
          if (!presence) return friend

          const newStatus = presence.isOnline ? 'active' as const : 'away' as const
          if (friend.status === newStatus) return friend

          needsUpdate = true
          return { ...friend, status: newStatus }
        })

        if (needsUpdate) {
          useSocialStore.setState({ friends: updatedFriends })
        }
      },

      // ─── Real-time Lifecycle Actions ───────────────────────────────────

      startRealtimeForConversation: (conversationId) => {
        rtSubscribe(conversationId, {
          onMessage: (msg) => get().onMessageReceived(conversationId, msg),
          onStatusUpdate: (msgId, status) =>
            get().onStatusUpdate(conversationId, msgId, status),
        })
        subscribeToTyping(conversationId, (user, isTyping) =>
          get().onTypingUpdate(conversationId, user, isTyping)
        )
        subscribeToPresence(
          conversationId,
          (states) => get().onPresenceSync(conversationId, states),
          get().currentUserId ?? undefined
        )
      },

      stopRealtimeForConversation: (conversationId) => {
        rtUnsubscribe(conversationId)
        set((state) => {
          const updatedTyping = { ...state.typingUsers }
          delete updatedTyping[conversationId]
          return { typingUsers: updatedTyping }
        })
      },

      stopAllRealtime: () => {
        unsubscribeAll()
        set({ typingUsers: {} })
      },

      // ─── Typing Send Action ────────────────────────────────────────────

      sendTyping: (conversationId, isTyping) => {
        const { currentUserId } = get()
        if (!currentUserId) return
        // Pull real display name and avatar from profile store
        const profile = useProfileStore.getState()
        const displayName = profile.fullName || profile.username || 'You'
        const avatarUrl = profile.avatarUrl ?? ''
        sendTypingIndicator(conversationId, currentUserId, displayName, avatarUrl, isTyping)
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
        get().stopAllRealtime()
        set({
          conversations: [],
          activeConversationId: null,
          conversationFilter: 'all',
          messages: {},
          totalUnread: 0,
          typingUsers: {},
          onlineUsers: {},
          currentUserId: null,
          isLoadingMessages: false,
          hasMoreMessages: {},
          shareTrayOpen: false,
        })
      },
    }),
    {
      name: 'messaging-store',
      // Exclude ephemeral/runtime-only state from localStorage persistence
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        conversationFilter: state.conversationFilter,
        messages: state.messages,
        totalUnread: state.totalUnread,
        onlineUsers: state.onlineUsers,
        currentUserId: state.currentUserId,
        hasMoreMessages: state.hasMoreMessages,
        // Deliberately excluded (ephemeral):
        //   typingUsers       — cleared on every mount
        //   isLoadingMessages — transient loading flag
        //   shareTrayOpen     — UI-only toggle, always starts closed
      }),
      version: 3, // Bumped to refresh avatar URLs to local paths
    }
  )
)
