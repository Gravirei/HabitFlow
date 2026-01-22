/**
 * TimerFocusContext
 * Manages timer focus state - hides other tabs when a timer is active
 */

import { createContext } from 'react'
import type { TimerFocusContextType } from './types'

export const TimerFocusContext = createContext<TimerFocusContextType | undefined>(undefined)
