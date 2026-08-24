/**
 * TimerFocusProvider
 * Provider component for timer focus context
 */

import React, { useState, ReactNode } from 'react'
import type { TimerMode } from '../../types/timer.types'
import { TimerFocusContext } from './TimerFocusContext'

export const TimerFocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [activeTimer, setActiveTimer] = useState<TimerMode | null>(null)

  const focusTimer = (mode: TimerMode) => {
    setIsTimerActive(true)
    setActiveTimer(mode)
  }

  const unfocusTimer = () => {
    setIsTimerActive(false)
    setActiveTimer(null)
  }

  return (
    <TimerFocusContext.Provider value={{ isTimerActive, activeTimer, focusTimer, unfocusTimer }}>
      {children}
    </TimerFocusContext.Provider>
  )
}
