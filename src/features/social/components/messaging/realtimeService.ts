/**
 * Realtime Service
 * Singleton module managing Supabase Realtime channel subscriptions
 * for messages (Postgres Changes), typing indicators (Broadcast),
 * and presence tracking (Presence API).
 *
 * Uses the shared Supabase client — never creates a new one.
 * Supabase JS v2 handles reconnection automatically; no custom logic here.
 */

import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Message, DeliveryStatus, TypingUser, PresenceState } from './types'
import { MESSAGING_LIMITS } from './constants'

// ─── Module-level State ─────────────────────────────────────────────────────

/** Track active channels for cleanup */
const activeChannels: Map<string, RealtimeChannel> = new Map()

/** Typing debounce timers per conversation */
const typingDebounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

/** Typing timeout timers (auto-clear after silence) per `${conversationId}:${userId}` */
const typingTimeoutTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Remove an existing channel from the map and from Supabase.
 * Uses `supabase.removeChannel()` for full cleanup (NOT `channel.unsubscribe()`).
 */
function removeChannel(key: string): void {
  const channel = activeChannels.get(key)
  if (channel) {
    supabase.removeChannel(channel)
    activeChannels.delete(key)
  }
}

/**
 * Map a raw Postgres row to the Message type.
 * Supabase Postgres Changes payloads use snake_case columns.
 */
function mapRowToMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    senderName: (row.sender_name as string) ?? '',
    senderAvatarUrl: (row.sender_avatar_url as string) ?? '',
    type: row.type as Message['type'],
    text: row.text as string | undefined,
    habitCard: row.habit_card as Message['habitCard'],
    badgeCard: row.badge_card as Message['badgeCard'],
    nudgeCard: row.nudge_card as Message['nudgeCard'],
    reactions: (row.reactions as Message['reactions']) ?? [],
    deliveryStatus: (row.delivery_status as DeliveryStatus) ?? 'sent',
    deliveredAt: row.delivered_at as string | undefined,
    readAt: row.read_at as string | undefined,
    createdAt: row.created_at as string,
    isDeleted: (row.is_deleted as boolean) ?? false,
  }
}

// ─── Exported Functions ─────────────────────────────────────────────────────

/**
 * 1. Subscribe to message changes (INSERT + UPDATE) for a conversation.
 *    Uses Postgres Changes on the `messages` table.
 */
export function subscribeToConversation(
  conversationId: string,
  callbacks: {
    onMessage: (message: Message) => void
    onStatusUpdate: (messageId: string, status: DeliveryStatus) => void
  }
): void {
  const key = `messages:${conversationId}`

  // Prevent duplicate subscriptions
  removeChannel(key)

  const channel = supabase
    .channel(key)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const message = mapRowToMessage(payload.new as Record<string, unknown>)
        callbacks.onMessage(message)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>
        const messageId = row.id as string

        if (row.read_at) {
          callbacks.onStatusUpdate(messageId, 'read')
        } else if (row.delivered_at) {
          callbacks.onStatusUpdate(messageId, 'delivered')
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error(`[realtimeService] Channel error for ${key}`)
      }
    })

  activeChannels.set(key, channel)
}

/**
 * 2. Subscribe to typing indicator broadcasts for a conversation.
 *    Uses Broadcast (ephemeral, no DB writes).
 */
export function subscribeToTyping(
  conversationId: string,
  onTyping: (user: TypingUser, isTyping: boolean) => void
): void {
  const key = `typing:${conversationId}`

  // Prevent duplicate subscriptions
  removeChannel(key)

  const channel = supabase
    .channel(key)
    .on('broadcast', { event: 'typing' }, (payload) => {
      const data = payload.payload as {
        userId: string
        displayName: string
        avatarUrl: string
        isTyping: boolean
      }

      const typingUser: TypingUser = {
        userId: data.userId,
        displayName: data.displayName,
        startedAt: new Date().toISOString(),
      }

      const timeoutKey = `${conversationId}:${data.userId}`

      if (data.isTyping) {
        // Clear existing timeout for this user, then set a new auto-clear
        const existingTimer = typingTimeoutTimers.get(timeoutKey)
        if (existingTimer) clearTimeout(existingTimer)

        const timer = setTimeout(() => {
          onTyping(typingUser, false)
          typingTimeoutTimers.delete(timeoutKey)
        }, MESSAGING_LIMITS.TYPING_TIMEOUT_MS)

        typingTimeoutTimers.set(timeoutKey, timer)
      } else {
        // Stop-typing received — clear the timeout
        const existingTimer = typingTimeoutTimers.get(timeoutKey)
        if (existingTimer) {
          clearTimeout(existingTimer)
          typingTimeoutTimers.delete(timeoutKey)
        }
      }

      onTyping(typingUser, data.isTyping)
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error(`[realtimeService] Channel error for ${key}`)
      }
    })

  activeChannels.set(key, channel)
}

/**
 * 3. Send a typing indicator via Broadcast.
 *    - isTyping=true → debounced by TYPING_DEBOUNCE_MS (500ms)
 *    - isTyping=false → sent immediately (stop-typing should never be delayed)
 */
export function sendTypingIndicator(
  conversationId: string,
  userId: string,
  displayName: string,
  avatarUrl: string,
  isTyping: boolean
): void {
  const key = `typing:${conversationId}`
  const channel = activeChannels.get(key)
  if (!channel) return // no-op if not subscribed

  const broadcast = () => {
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, displayName, avatarUrl, isTyping },
    })
  }

  if (isTyping) {
    // Debounce: only send if no pending timer
    if (!typingDebounceTimers.has(conversationId)) {
      const timer = setTimeout(() => {
        broadcast()
        typingDebounceTimers.delete(conversationId)
      }, MESSAGING_LIMITS.TYPING_DEBOUNCE_MS)

      typingDebounceTimers.set(conversationId, timer)
    }
  } else {
    // Stop-typing: clear debounce and send immediately
    const existingTimer = typingDebounceTimers.get(conversationId)
    if (existingTimer) {
      clearTimeout(existingTimer)
      typingDebounceTimers.delete(conversationId)
    }
    broadcast()
  }
}

/**
 * 4. Subscribe to presence for a conversation.
 *    Uses the Supabase Presence API (sync, join, leave events).
 */
export function subscribeToPresence(
  conversationId: string,
  onPresenceChange: (state: PresenceState[]) => void,
  currentUserId?: string
): void {
  const key = `presence:${conversationId}`

  // Prevent duplicate subscriptions
  removeChannel(key)

  const channel = supabase.channel(key)

  /** Transform raw presence state into PresenceState[] */
  const syncPresence = () => {
    const presenceState = channel.presenceState()
    const states: PresenceState[] = []

    for (const [_key, presences] of Object.entries(presenceState)) {
      // Each key maps to an array of presence objects
      for (const presence of presences as Array<Record<string, unknown>>) {
        states.push({
          userId: presence.userId as string,
          isOnline: true,
          lastSeen: (presence.online_at as string) ?? new Date().toISOString(),
        })
      }
    }

    onPresenceChange(states)
  }

  channel
    .on('presence', { event: 'sync' }, () => {
      syncPresence()
    })
    .on('presence', { event: 'join' }, () => {
      syncPresence()
    })
    .on('presence', { event: 'leave' }, () => {
      syncPresence()
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && currentUserId) {
        await channel.track({
          userId: currentUserId,
          online_at: new Date().toISOString(),
        })
      }
      if (status === 'CHANNEL_ERROR') {
        console.error(`[realtimeService] Channel error for ${key}`)
      }
    })

  activeChannels.set(key, channel)
}

/**
 * 5. Unsubscribe from ALL channels related to a conversation
 *    (messages, typing, presence) and clean up timers.
 */
export function unsubscribeFromConversation(conversationId: string): void {
  // Remove all three channel types
  removeChannel(`messages:${conversationId}`)
  removeChannel(`typing:${conversationId}`)
  removeChannel(`presence:${conversationId}`)

  // Clear typing debounce timer for this conversation
  const debounceTimer = typingDebounceTimers.get(conversationId)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    typingDebounceTimers.delete(conversationId)
  }

  // Clear all typing timeout timers for this conversation
  for (const [key, timer] of typingTimeoutTimers.entries()) {
    if (key.startsWith(`${conversationId}:`)) {
      clearTimeout(timer)
      typingTimeoutTimers.delete(key)
    }
  }
}

/**
 * 6. Unsubscribe from ALL active channels and clear all timers.
 *    Called on logout / app teardown.
 */
export function unsubscribeAll(): void {
  // Remove all channels
  for (const [, channel] of activeChannels) {
    supabase.removeChannel(channel)
  }
  activeChannels.clear()

  // Clear all debounce timers
  for (const [, timer] of typingDebounceTimers) {
    clearTimeout(timer)
  }
  typingDebounceTimers.clear()

  // Clear all timeout timers
  for (const [, timer] of typingTimeoutTimers) {
    clearTimeout(timer)
  }
  typingTimeoutTimers.clear()
}

/**
 * 7. Get the current connection status based on active channels.
 */
export function getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
  if (activeChannels.size === 0) {
    return 'disconnected'
  }

  for (const [, channel] of activeChannels) {
    // RealtimeChannel exposes a `state` property in Supabase JS v2
    // 'joined' means fully connected, 'joining' means in progress
    const state = (channel as unknown as { state: string }).state
    if (state === 'joined') {
      return 'connected'
    }
  }

  return 'connecting'
}
