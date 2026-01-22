/**
 * useAnimationFrame Hook
 * 
 * Provides optimized rendering updates using requestAnimationFrame.
 * Separates visual updates from time calculations for better performance.
 * 
 * Benefits:
 * - Syncs with browser's refresh rate (~60fps)
 * - Reduces unnecessary renders
 * - Better battery life on mobile
 * - Smoother animations
 * 
 * CRITICAL FIX: Ensures proper cleanup of animation frames on unmount
 * to prevent memory leaks and stale callbacks.
 * 
 * Usage:
 * ```tsx
 * const [displayTime, setDisplayTime] = useState(0)
 * 
 * useAnimationFrame((deltaTime) => {
 *   // Update display state at ~60fps
 *   setDisplayTime(getCurrentTime())
 * }, [dependency])
 * ```
 * 
 * @module useAnimationFrame
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import React from 'react'

export type AnimationFrameCallback = (deltaTime: number) => void

/**
 * Hook that calls a callback function on every animation frame
 * 
 * @param callback - Function to call on each frame (receives deltaTime in ms)
 * @param deps - Dependencies array (like useEffect)
 * @param isActive - Whether the animation should be running (default: true)
 */
export const useAnimationFrame = (
  callback: AnimationFrameCallback,
  deps: React.DependencyList = [],
  isActive: boolean = true
): void => {
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number | undefined>(undefined)
  const callbackRef = useRef<AnimationFrameCallback>(callback)
  const isActiveRef = useRef<boolean>(isActive)
  const isMountedRef = useRef<boolean>(true)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Track active state in ref for use in animation loop
  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  // Cleanup function that cancels animation frame
  const cleanup = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
    previousTimeRef.current = undefined
  }, [])

  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true

    if (!isActive) {
      // Cancel any pending animation frame if not active
      cleanup()
      return
    }

    const animate = (time: number) => {
      // Safety check: don't continue if unmounted or inactive
      if (!isMountedRef.current || !isActiveRef.current) {
        cleanup()
        return
      }

      // Calculate delta time (time since last frame)
      const deltaTime = previousTimeRef.current !== undefined 
        ? time - previousTimeRef.current 
        : 0

      previousTimeRef.current = time

      // Call the callback with delta time (wrapped in try-catch for safety)
      try {
        callbackRef.current(deltaTime)
      } catch (error) {
        console.error('[useAnimationFrame] Callback error:', error)
        // Don't stop the animation loop on callback errors
      }

      // Request next frame only if still mounted and active
      if (isMountedRef.current && isActiveRef.current) {
        requestRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation loop
    requestRef.current = requestAnimationFrame(animate)

    // Cleanup on unmount or dependency change
    return () => {
      isMountedRef.current = false
      cleanup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, isActive, cleanup])

  // Additional cleanup on component unmount (belt and suspenders)
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = null
      }
    }
  }, [])
}

/**
 * Hook variant that provides the current time value updated via RAF
 * Useful for simple time-based animations
 * 
 * @param isActive - Whether updates should be active
 * @returns Current timestamp from performance.now()
 */
export const useAnimationFrameTime = (isActive: boolean = true): number => {
  const [time, setTime] = useState(0)
  const isMountedRef = useRef<boolean>(true)

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useAnimationFrame(() => {
    // Only update state if component is still mounted
    if (isMountedRef.current) {
      setTime(performance.now())
    }
  }, [], isActive)

  return time
}
