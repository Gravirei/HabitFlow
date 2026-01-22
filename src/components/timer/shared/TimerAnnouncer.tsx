/**
 * TimerAnnouncer Component
 * Provides screen reader announcements for timer state changes
 * Uses aria-live regions for accessibility
 */

import React from 'react'

interface TimerAnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
}

export const TimerAnnouncer: React.FC<TimerAnnouncerProps> = ({ message, priority = 'polite' }) => {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

TimerAnnouncer.displayName = 'TimerAnnouncer'
