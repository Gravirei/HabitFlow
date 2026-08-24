/**
 * useBodyScrollLock Hook
 * Prevents body scrolling when modal is open
 * Essential for mobile accessibility
 */

import { useEffect } from 'react'

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    // Store original overflow value
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Prevent scroll
    document.body.style.overflow = 'hidden'
    
    // Add padding to prevent layout shift (if scrollbar was visible)
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isLocked])
}
