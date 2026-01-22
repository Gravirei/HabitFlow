import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * useDebounceCallback Hook
 * 
 * Creates a debounced version of a callback function that delays execution
 * until after a specified delay has elapsed since the last invocation.
 * 
 * Perfect for throttling expensive operations like localStorage writes.
 * 
 * @example
 * ```tsx
 * const debouncedSave = useDebounceCallback(
 *   (data) => localStorage.setItem('key', data),
 *   1000 // Wait 1 second after last call
 * )
 * 
 * // Call multiple times - only executes once after 1 second of inactivity
 * debouncedSave('value1')
 * debouncedSave('value2')
 * debouncedSave('value3')
 * ```
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    ((...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

/**
 * useImmediateSave Hook
 * 
 * Provides both debounced and immediate save functions.
 * Useful for scenarios where you want to debounce most saves
 * but immediately save on certain events (pause, kill, etc.)
 * 
 * @example
 * ```tsx
 * const { debouncedSave, immediateSave, flush } = useImmediateSave(
 *   (data) => localStorage.setItem('key', data),
 *   1000
 * )
 * 
 * // During timer: debounced save (every 1 second max)
 * debouncedSave(state)
 * 
 * // On pause: save immediately
 * immediateSave(state)
 * 
 * // On unmount: flush any pending saves
 * flush()
 * ```
 */
export function useImmediateSave<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): {
  debouncedSave: T
  immediateSave: T
  flush: () => void
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)
  const lastArgsRef = useRef<Parameters<T> | null>(null)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Flush any pending saves
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (lastArgsRef.current) {
      callbackRef.current(...lastArgsRef.current)
      lastArgsRef.current = null
    }
  }, [])

  // Immediate save (bypasses debounce)
  const immediateSave = useCallback(
    ((...args: Parameters<T>) => {
      // Cancel pending debounced save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      lastArgsRef.current = null
      // Execute immediately
      callbackRef.current(...args)
    }) as T,
    []
  )

  // Debounced save
  const debouncedSave = useCallback(
    ((...args: Parameters<T>) => {
      // Store latest args
      lastArgsRef.current = args

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
        lastArgsRef.current = null
      }, delay)
    }) as T,
    [delay]
  )

  return {
    debouncedSave,
    immediateSave,
    flush
  }
}
