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

// Real-time Service
export * from './realtimeService'

// Core UI Components (Phase 4)
export { MessagingHub } from './MessagingHub'
export { ConversationScreen } from './ConversationScreen'
export { MessageBubble } from './MessageBubble'
export { MessageInputBar } from './MessageInputBar'

// Rich Message Cards (Phase 5)
export { HabitShareCard } from './HabitShareCard'
export { BadgeShareCard } from './BadgeShareCard'
export { NudgeMessageCard } from './NudgeMessageCard'
export { ReactionPicker } from './ReactionPicker'
export { ReactionRow } from './ReactionRow'
export { TypingIndicator } from './TypingIndicator'

// Group Chat (Phase 6)
export { GroupCreationFlow } from './GroupCreationFlow'
export { GroupInfoScreen } from './GroupInfoScreen'
