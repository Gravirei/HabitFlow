/**
 * Live Region Announcer Component
 * Provides screen reader announcements for dynamic content changes
 */

import React, { useEffect, useRef } from 'react'

interface LiveRegionAnnouncerProps {
  message: string
  politeness?: 'polite' | 'assertive'
  clearOnUnmount?: boolean
}

/**
 * Announces messages to screen readers without visual changes
 * Used for filter changes, loading states, and dynamic updates
 */
export function LiveRegionAnnouncer({ 
  message, 
  politeness = 'polite',
  clearOnUnmount = true 
}: LiveRegionAnnouncerProps) {
  const previousMessage = useRef<string>('')

  useEffect(() => {
    // Only announce if message has changed
    if (message && message !== previousMessage.current) {
      previousMessage.current = message
    }

    return () => {
      if (clearOnUnmount) {
        previousMessage.current = ''
      }
    }
  }, [message, clearOnUnmount])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

/**
 * Hook for managing live region announcements
 */
export function useLiveRegion() {
  const [message, setMessage] = React.useState('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  const announce = (text: string, duration = 3000) => {
    setMessage(text)
    
    // Clear message after duration
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setMessage('')
    }, duration)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { message, announce }
}
