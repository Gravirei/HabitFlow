import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for managing localStorage with React state
 * Automatically syncs across all components using the same key
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns A tuple of [value, setValue]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Wrapped setValue to dispatch custom event for cross-component sync
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prevValue => {
      const valueToStore = value instanceof Function ? value(prevValue) : value
      
      try {
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, value: valueToStore }
        }))
      } catch (error) {
        // Handle localStorage quota exceeded error
        if (error instanceof DOMException && (
          error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        )) {
          console.error(`localStorage quota exceeded for key "${key}". Consider clearing old data.`)
          // Attempt to notify user (optional - could dispatch a global error event)
          window.dispatchEvent(new CustomEvent('local-storage-quota-exceeded', {
            detail: { key }
          }))
        } else {
          console.error(`Error setting localStorage key "${key}":`, error)
        }
      }
      
      return valueToStore
    })
  }, [key])

  // Listen for storage changes from other components or tabs
  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: T }>
      
      // Only update if it's for our key
      if (customEvent.detail?.key === key) {
        setStoredValue(customEvent.detail.value)
      }
    }

    // Listen for custom events (same tab/component changes)
    window.addEventListener('local-storage-change', handleStorageChange)

    // Listen for native storage events (changes from other tabs)
    const handleNativeStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }
    window.addEventListener('storage', handleNativeStorageChange)

    return () => {
      window.removeEventListener('local-storage-change', handleStorageChange)
      window.removeEventListener('storage', handleNativeStorageChange)
    }
  }, [key])

  return [storedValue, setValue] as const
}
