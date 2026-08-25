/**
 * Messaging System Constants
 * Design tokens, animation catalogue, reaction emojis, and message limits
 */

import type { DeliveryStatus } from './types'

// ─── Design Tokens ──────────────────────────────────────────────────────────
// Colors aligned with SOCIAL_DESIGN_TOKENS where noted.
// Brand primary: #13ec5b — matches SOCIAL_DESIGN_TOKENS.brand.primary.

export const MESSAGING_DESIGN_TOKENS = {
  /** Message bubble backgrounds */
  bubble: {
    sent: '#13ec5b',          // brand primary — current user's messages
    sentText: '#003811',      // dark text on green bubble
    received: 'rgba(255, 255, 255, 0.06)', // subtle white — other user's messages
    receivedText: '#ffffff',
    system: 'rgba(255, 255, 255, 0.03)',   // system messages — very subtle
    systemText: 'rgba(255, 255, 255, 0.5)',
  },

  /** Rich card accent colors — match social rarity system */
  cardAccent: {
    habit: '#13ec5b',    // brand green — habit completions
    badge: '#a855f7',    // purple — badge unlocks (matches SOCIAL_DESIGN_TOKENS.rarity.epic.from)
    xp: '#f59e0b',       // amber — XP milestones (matches SOCIAL_DESIGN_TOKENS.rarity.legendary.from)
    nudge: '#3b82f6',    // blue — nudges (matches SOCIAL_DESIGN_TOKENS.rarity.rare.from)
  },

  /** Input bar */
  input: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.1)',
    placeholder: 'rgba(255, 255, 255, 0.4)',
  },

  /** Delivery status indicator colors */
  deliveryStatus: {
    sending: 'rgba(255, 255, 255, 0.3)',
    sent: 'rgba(255, 255, 255, 0.5)',
    delivered: '#13ec5b',
    read: '#3b82f6',
  },

  /** Surface & border — extends social tokens for messaging context */
  surface: {
    conversationHover: 0.03,
    conversationActive: 0.05,
    reactionPicker: 'rgba(255, 255, 255, 0.08)',
  },
} as const

// ─── Animation Catalogue ────────────────────────────────────────────────────
// Complete micro-interaction timing definitions for every messaging interaction.
// Each entry provides Framer Motion transition props and a reducedMotion fallback.

export const MESSAGING_ANIMATIONS = {
  /** New message slides in from bottom */
  messageEntrance: {
    trigger: 'New message added to conversation',
    duration: 250,
    easing: 'spring',
    framerProps: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { type: 'spring', damping: 25, stiffness: 350, duration: 0.25 },
    },
    reducedMotion: {
      initial: { opacity: 1, y: 0, scale: 1 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0 },
    },
    notes: 'Sent messages slide from right, received from left. Y-offset provides upward flow.',
  },

  /** Reaction picker expands from emoji button */
  reactionPickerOpen: {
    trigger: 'Long-press or tap reaction button on message',
    duration: 200,
    easing: 'spring',
    framerProps: {
      initial: { opacity: 0, scale: 0.8, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { type: 'spring', damping: 20, stiffness: 400, duration: 0.2 },
    },
    reducedMotion: {
      initial: { opacity: 1, scale: 1, y: 0 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { duration: 0 },
    },
    notes: 'Picker appears above or below message based on screen position.',
  },

  /** Reaction picker closes */
  reactionPickerClose: {
    trigger: 'Tap outside picker or select an emoji',
    duration: 150,
    easing: 'easeIn',
    framerProps: {
      exit: { opacity: 0, scale: 0.8, y: 5 },
      transition: { duration: 0.15, ease: 'easeIn' },
    },
    reducedMotion: {
      exit: { opacity: 0 },
      transition: { duration: 0 },
    },
    notes: 'Faster than open for snappy feel. AnimatePresence required.',
  },

  /** Typing indicator dots pulse */
  typingDots: {
    trigger: 'Other user is typing in conversation',
    duration: 1200,
    easing: 'easeInOut',
    framerProps: {
      animate: { y: [0, -4, 0] },
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
    reducedMotion: {
      animate: { opacity: [0.5, 1, 0.5] },
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
    notes: 'Three dots with staggered delay (0ms, 150ms, 300ms). Reduced motion uses opacity fade instead of bounce.',
  },

  /** Share tray slides up from bottom */
  shareTrayEntrance: {
    trigger: 'User taps share/attach button in message input',
    duration: 300,
    easing: 'spring',
    framerProps: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { type: 'spring', damping: 25, stiffness: 300, duration: 0.3 },
    },
    reducedMotion: {
      initial: { y: 0, opacity: 1 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0 },
    },
    notes: 'Bottom sheet pattern. Backdrop fades in simultaneously.',
  },

  /** Share tray slides down */
  shareTrayExit: {
    trigger: 'User taps backdrop or selects share item',
    duration: 200,
    easing: 'easeIn',
    framerProps: {
      exit: { y: '100%', opacity: 0 },
      transition: { duration: 0.2, ease: 'easeIn' },
    },
    reducedMotion: {
      exit: { opacity: 0 },
      transition: { duration: 0 },
    },
    notes: 'Faster than entrance. No spring on exit.',
  },

  /** Conversation row entrance in list */
  conversationRowEntrance: {
    trigger: 'Conversations list mounts or new conversation created',
    duration: 200,
    easing: 'easeOut',
    framerProps: {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    reducedMotion: {
      initial: { opacity: 1, x: 0 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0 },
    },
    notes: 'Stagger children by 30ms each for cascade effect.',
  },
} as const

// ─── Reaction Emojis ────────────────────────────────────────────────────────

export const REACTION_EMOJIS = ['🔥', '💪', '👏', '⭐', '😄', '🎯', '🙌', '❤️'] as const

// ─── Messaging Limits ───────────────────────────────────────────────────────

export const MESSAGING_LIMITS = {
  MAX_GROUP_MEMBERS: 30,
  MAX_MESSAGE_LENGTH: 2000,
  MESSAGES_PER_PAGE: 50,
  TYPING_DEBOUNCE_MS: 500,
  TYPING_TIMEOUT_MS: 3000,
  MAX_REACTIONS_PER_MESSAGE: 8,  // matches REACTION_EMOJIS.length
  CONVERSATION_NAME_MAX_LENGTH: 50,
} as const

// ─── Delivery Status Icons ──────────────────────────────────────────────────

export const DELIVERY_STATUS_ICONS: Record<DeliveryStatus, { icon: string; label: string }> = {
  sending: { icon: '⏳', label: 'Sending' },
  sent: { icon: '✓', label: 'Sent' },
  delivered: { icon: '✓✓', label: 'Delivered' },
  read: { icon: '✓✓', label: 'Read' },
}
