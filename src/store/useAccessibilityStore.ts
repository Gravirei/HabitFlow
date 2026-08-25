import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AccessibilityState {
  showAccessibilityButton: boolean
  setShowAccessibilityButton: (value: boolean) => void
  toggleAccessibilityButton: () => void
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      showAccessibilityButton: true,
      setShowAccessibilityButton: (value) => set({ showAccessibilityButton: value }),
      toggleAccessibilityButton: () =>
        set((state) => ({ showAccessibilityButton: !state.showAccessibilityButton })),
    }),
    {
      name: 'accessibility-store',
    }
  )
)
