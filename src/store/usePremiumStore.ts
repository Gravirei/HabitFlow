import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, format } from 'date-fns'

type PremiumTier = 'free' | 'pro' | 'team'

interface PremiumState {
  tier: PremiumTier
  trialEndsAt: string | null
  isTrialActive: boolean
  subscribedAt: string | null

  // Computed helpers
  isPro: () => boolean
  isTeam: () => boolean
  isPremium: () => boolean

  // Feature gates
  canUseAIInsights: () => boolean
  canUseCloudSync: () => boolean
  canUseAdvancedExport: () => boolean
  canUseTeamSharing: () => boolean
  canUseCustomThemes: () => boolean
  canUseAPIAccess: () => boolean
  getMaxCategories: () => number
  getMaxHabits: () => number

  // Actions
  setTier: (tier: PremiumTier) => void
  startTrial: () => void
  cancelSubscription: () => void
  reset: () => void
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      trialEndsAt: null,
      isTrialActive: false,
      subscribedAt: null,

      // Computed helpers
      isPro: () => {
        return get().tier === 'pro'
      },

      isTeam: () => {
        return get().tier === 'team'
      },

      isPremium: () => {
        return get().tier !== 'free'
      },

      // Feature gates
      canUseAIInsights: () => {
        return get().isPremium()
      },

      canUseCloudSync: () => {
        return get().isPremium()
      },

      canUseAdvancedExport: () => {
        return get().isPremium()
      },

      canUseTeamSharing: () => {
        return get().isTeam()
      },

      canUseCustomThemes: () => {
        return get().isPremium()
      },

      canUseAPIAccess: () => {
        return get().isTeam()
      },

      getMaxCategories: () => {
        const tier = get().tier
        if (tier === 'free') return 5
        return Infinity
      },

      getMaxHabits: () => {
        const tier = get().tier
        if (tier === 'free') return 15
        return Infinity
      },

      // Actions
      setTier: (tier) => {
        set((state) => ({
          tier,
          subscribedAt: tier !== 'free' && state.tier === 'free' ? new Date().toISOString() : state.subscribedAt,
        }))
      },

      startTrial: () => {
        const trialEnd = addDays(new Date(), 14)
        set({
          tier: 'pro',
          trialEndsAt: trialEnd.toISOString(),
          isTrialActive: true,
        })
      },

      cancelSubscription: () => {
        set({
          tier: 'free',
          trialEndsAt: null,
          isTrialActive: false,
          subscribedAt: null,
        })
      },

      reset: () => {
        set({
          tier: 'free',
          trialEndsAt: null,
          isTrialActive: false,
          subscribedAt: null,
        })
      },
    }),
    {
      name: 'premium-store',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)
