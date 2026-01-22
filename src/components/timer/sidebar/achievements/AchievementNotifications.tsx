/**
 * Achievement Notifications Component
 * Manages and displays achievement unlock notifications
 */

import React, { useEffect, useState } from 'react'
import { AchievementToast } from './AchievementToast'
import { useAchievementSync } from './useAchievementSync'
import type { Achievement } from './types'

export function AchievementNotifications() {
  const { newlyUnlocked, clearNewlyUnlocked } = useAchievementSync()
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null)
  const [queue, setQueue] = useState<Achievement[]>([])

  /**
   * Process newly unlocked achievements
   */
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setQueue((prev) => [...prev, ...newlyUnlocked])
      clearNewlyUnlocked()
    }
  }, [newlyUnlocked, clearNewlyUnlocked])

  /**
   * Show next achievement in queue
   */
  useEffect(() => {
    if (!currentToast && queue.length > 0) {
      const [next, ...rest] = queue
      setCurrentToast(next)
      setQueue(rest)

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setCurrentToast(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [currentToast, queue])

  /**
   * Handle manual close
   */
  const handleClose = () => {
    setCurrentToast(null)
  }

  return <AchievementToast achievement={currentToast} onClose={handleClose} />
}
