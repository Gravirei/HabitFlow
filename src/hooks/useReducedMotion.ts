/**
 * useReducedMotion Hook
 * 
 * Detects if the user has requested reduced motion via their OS settings.
 * Respects the 'prefers-reduced-motion' CSS media query for accessibility.
 * 
 * Usage:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 * 
 * <div className={cn(
 *   "base-styles",
 *   !prefersReducedMotion && "animate-pulse"
 * )}>
 * ```
 * 
 * @returns {boolean} true if user prefers reduced motion, false otherwise
 */

import { useState, useEffect } from 'react'

export const useReducedMotion = (): boolean => {
  // Check initial preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Server-side rendering safety
    if (typeof window === 'undefined') return false
    
    // Check if matchMedia is supported
    if (!window.matchMedia) return false
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    // Skip if not in browser or matchMedia not supported
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Update state when preference changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers (Safari < 14)
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}
