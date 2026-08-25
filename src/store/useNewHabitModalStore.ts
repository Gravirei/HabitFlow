import { create } from 'zustand'

interface NewHabitModalState {
  isOpen: boolean
  open: () => void
  close: () => void
}

/**
 * Global open/close state for the "Create new habit" modal so any entry point
 * (Today FAB, bottom-nav center button, ProgressOverview empty state) can open
 * it in-place without navigating away from the current page.
 */
export const useNewHabitModalStore = create<NewHabitModalState>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
