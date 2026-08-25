/**
 * Social feature (includes the messaging subdomain).
 * Public API — cross-feature consumers should import from here.
 */
export * from './components'
export { SocialBottomNav, type SocialTab } from './components/SocialBottomNav'
export { useSocialStore } from './store/socialStore'
export { useMessagingStore } from './store/messagingStore'
