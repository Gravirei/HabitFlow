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

// Components — Phase 4
export { MessagingHub } from './MessagingHub'
export { ConversationScreen } from './ConversationScreen'
export { MessageBubble } from './MessageBubble'
export { MessageInputBar } from './MessageInputBar'

// Phase 6: GroupCreationFlow, GroupInfoScreen

// Phase 5: Rich Message Cards & Reactions
export { HabitShareCard } from './HabitShareCard'
export { BadgeShareCard } from './BadgeShareCard'
export { NudgeMessageCard } from './NudgeMessageCard'
export { ReactionPicker } from './ReactionPicker'
export { ReactionRow } from './ReactionRow'
export { TypingIndicator } from './TypingIndicator'
