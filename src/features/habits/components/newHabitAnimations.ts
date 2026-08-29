import type { Variants } from 'framer-motion'

/**
 * Motion choreography for the New Habit wizard.
 *
 * Entrance cascade: the panel slides up (NewHabitModal) → the CTA pops
 * (in the wizard) → the sidebar slides in item by item → the step
 * content rises into place once the modal has fully opened.
 *
 * All factories take `reduced` (prefers-reduced-motion) and degrade to
 * plain, quick fades with no stagger or slide.
 */

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Sidebar header / footer: slide in from the left on their own schedule
 * (not part of the step-list stagger).
 */
export const sidebarEdge = (reduced: boolean, delay: number): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: reduced ? { duration: 0.2, delay } : { duration: 0.55, ease: EASE_OUT_EXPO, delay },
  },
})

/** Sidebar step list: staggers its items in slowly, top to bottom. */
export const sidebarList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.3 } },
}

/** One sidebar step row: slides in from the left while fading. */
export const sidebarItem = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: reduced ? { duration: 0.2 } : { duration: 0.55, ease: EASE_OUT_EXPO },
  },
})

/**
 * Step content container. On first mount it waits for the modal to finish
 * opening (entranceDone flips ~0.55s after mount); later step changes
 * start almost immediately so navigation feels snappy.
 */
export const stepContainer = (reduced: boolean, entranceDone: boolean): Variants => ({
  hidden: {},
  visible: {
    transition: reduced
      ? { staggerChildren: 0 }
      : { staggerChildren: 0.09, delayChildren: entranceDone ? 0.05 : 0.5 },
  },
})

/** One step content block: rises into place while fading. */
export const stepItem = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced ? { duration: 0.2 } : { duration: 0.5, ease: EASE_OUT_EXPO },
  },
})
