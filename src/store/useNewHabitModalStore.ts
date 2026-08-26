import { create } from 'zustand'

/** Optional presets forwarded to the wizard when the modal opens. */
export interface NewHabitModalOptions {
  /** Preselect a frequency (e.g. from the Habits page tabs or speed dial). */
  defaultFrequency?: 'daily' | 'weekly' | 'monthly'
  /** Preselect a category (e.g. adding a habit from CategoryDetail). */
  categoryId?: string
}

interface NewHabitModalState extends NewHabitModalOptions {
  isOpen: boolean
  open: (options?: NewHabitModalOptions) => void
  close: () => void
}

/**
 * Global open/close state for the "Create new habit" modal so any entry point
 * (Today FAB, bottom-nav center button, ProgressOverview empty state) can open
 * it in-place without navigating away from the current page.
 */
export const useNewHabitModalStore = create<NewHabitModalState>()((set) => ({
  isOpen: false,
  open: (options) => set({ isOpen: true, ...options }),
  // Clear presets on close so the next plain open() starts fresh
  close: () => set({ isOpen: false, defaultFrequency: undefined, categoryId: undefined }),
}))
