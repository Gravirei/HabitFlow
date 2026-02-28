/**
 * Messaging System
 * Barrel exports for all messaging features
 */

// Types
export type * from './types'

// Constants
export * from './constants'

// Store
export { useMessagingStore } from './messagingStore'

// Realtime Service
export {
  subscribeToConversation,
  subscribeToTyping,
  subscribeToPresence,
  sendTypingIndicator,
  unsubscribeFromConversation,
  unsubscribeAll,
  getConnectionStatus,
} from './realtimeService'

// Components (added in later phases)
// Phase 4: MessagingHub, ConversationScreen, MessageBubble, MessageInputBar
// Phase 5: HabitShareCard, BadgeShareCard, NudgeMessageCard, ReactionPicker, ReactionRow, TypingIndicator
// Phase 6: GroupCreationFlow, GroupInfoScreen
