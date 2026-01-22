/**
 * TimerContainer Component
 * Main container that orchestrates all timer modes
 * 
 * CRITICAL FIX: Added error boundaries around timer mode components
 * to prevent crashes from propagating to the entire app.
 */

import React, { useState, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimerMode } from './types/timer.types'
import { StopwatchTimer } from './modes/StopwatchTimer'
import { CountdownTimer } from './modes/CountdownTimer'
import { IntervalsTimer } from './modes/IntervalsTimer'
import { TimerTopNav } from './shared/TimerTopNav'
import { KeyboardHelpModal } from './shared/KeyboardHelpModal'
import { TimerFocusProvider } from './context/TimerContext'
import { useTimerFocus } from './hooks/useTimerFocus'
import { timerPersistence } from './utils/timerPersistence'
import { TimerErrorBoundary } from './shared/TimerErrorBoundary'

// Context for keyboard help modal
interface KeyboardHelpContextType {
  showHelp: () => void
  isHelpModalOpen: boolean
}

const KeyboardHelpContext = createContext<KeyboardHelpContextType | null>(null)

export const useKeyboardHelp = () => {
  const context = useContext(KeyboardHelpContext)
  if (!context) {
    throw new Error('useKeyboardHelp must be used within KeyboardHelpProvider')
  }
  return context
}

const TimerContent: React.FC = () => {
  // Check for saved timer mode on mount and set initial mode
  const getInitialMode = (): TimerMode => {
    // First check for repeat session (from Premium History repeat/resume)
    const repeatSessionMode = timerPersistence.hasRepeatSession() 
      ? (() => {
          try {
            const savedData = localStorage.getItem('flowmodoro_repeat_session')
            if (savedData) {
              const config = JSON.parse(savedData)
              if (config.mode) {
                console.log('[TimerContainer] Found repeat session, switching to:', config.mode)
                return config.mode as TimerMode
              }
            }
          } catch {
            // Ignore errors
          }
          return null
        })()
      : null
    
    if (repeatSessionMode) {
      return repeatSessionMode
    }
    
    const savedState = timerPersistence.loadState()
    const activeTimer = timerPersistence.getActiveTimer()
    
    // If we have both saved state and active timer, use that mode
    if (savedState && activeTimer) {
      console.log('[TimerContainer] Restoring timer mode:', activeTimer)
      return activeTimer
    }
    
    // Default to Stopwatch
    return 'Stopwatch'
  }

  const [mode, setMode] = useState<TimerMode>(getInitialMode())
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const { isTimerActive, activeTimer } = useTimerFocus()
  
  // Refs to track tab positions for precise centering logic
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  // Global keyboard listener for ? key to open help
  React.useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Open help with ? key (shift + /)
      if (e.key === '?' && !isHelpModalOpen) {
        e.preventDefault()
        setIsHelpModalOpen(true)
      }
      // Close help with Esc
      if (e.key === 'Escape' && isHelpModalOpen) {
        e.preventDefault()
        setIsHelpModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyPress)
    return () => window.removeEventListener('keydown', handleGlobalKeyPress)
  }, [isHelpModalOpen])

  /**
   * Renders the appropriate timer component wrapped in an error boundary.
   * Each timer mode has its own error boundary to isolate failures.
   */
  const renderTimer = () => {
    const timerComponent = (() => {
      switch (mode) {
        case 'Stopwatch':
          return <StopwatchTimer />
        case 'Countdown':
          return <CountdownTimer />
        case 'Intervals':
          return <IntervalsTimer />
        default:
          return <StopwatchTimer />
      }
    })()

    return (
      <TimerErrorBoundary
        key={mode} // Reset error boundary when mode changes
        onError={(error, errorInfo) => {
          console.error(`[TimerContainer] Error in ${mode} timer:`, error, errorInfo)
        }}
      >
        {timerComponent}
      </TimerErrorBoundary>
    )
  }

  return (
    <KeyboardHelpContext.Provider value={{ 
      showHelp: () => setIsHelpModalOpen(true),
      isHelpModalOpen 
    }}>
      <div className="relative flex h-full w-full flex-col bg-background-dark">
        {/* Top Navigation Bar */}
        <TimerTopNav />
      
      {/* Mode Selector */}
      <div className="header flex items-center justify-center px-4 py-10 shrink-0 min-h-[120px]">
        <motion.div
          layout
          role="tablist"
          aria-label="Timer modes"
          className={`tabs-container relative flex items-center rounded-full transition-all duration-[800ms] ${
            isTimerActive
              ? 'bg-transparent'
              : 'bg-[#1e293b] p-[6px]'
          }`}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <AnimatePresence mode="popLayout">
            {(['Stopwatch', 'Countdown', 'Intervals'] as TimerMode[]).map((modeOption) => {
              const shouldShow = !isTimerActive || modeOption === activeTimer
              const isActive = mode === modeOption

              // Exact logic from HTML script: deltaX = centerX - tabCenterX
              const calculateDeltaX = () => {
                const el = tabsRef.current[modeOption]
                if (!isTimerActive || !isActive || !el) return 0

                const tabRect = el.getBoundingClientRect()
                const centerX = window.innerWidth / 2
                const tabCenterX = tabRect.left + tabRect.width / 2
                return centerX - tabCenterX
              }

              return (
                <motion.button
                  key={modeOption}
                  ref={(el) => (tabsRef.current[modeOption] = el)}
                  layout
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${modeOption.toLowerCase()}-panel`}
                  aria-label={`${modeOption} timer mode`}
                  tabIndex={isActive ? 0 : -1}
                  disabled={isTimerActive}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: shouldShow ? 1 : 0,
                    scale: shouldShow ? (isTimerActive && isActive ? 1.5 : 1) : 0.5,
                    x: calculateDeltaX(),
                    pointerEvents: shouldShow && !isTimerActive ? 'auto' : 'none',
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  onClick={() => !isTimerActive && setMode(modeOption)}
                  onKeyDown={(e) => {
                    if (isTimerActive) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setMode(modeOption)
                    }
                    // Arrow key navigation
                    const modes: TimerMode[] = ['Stopwatch', 'Countdown', 'Intervals']
                    const currentIndex = modes.indexOf(mode)
                    if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      const nextIndex = (currentIndex + 1) % modes.length
                      setMode(modes[nextIndex])
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      const prevIndex = (currentIndex - 1 + modes.length) % modes.length
                      setMode(modes[prevIndex])
                    }
                  }}
                  className={`
                    tab relative rounded-full px-4 md:px-10 py-4 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap min-w-0 md:min-w-[160px] flex-1 md:flex-none
                    ${isActive ? 'text-[#38bdf8]' : 'text-[#94a3b8]'}
                    ${isTimerActive && isActive ? 'text-[#818cf8]' : ''}
                    focus:outline-none
                  `}
                >
                  {/* Icon SVG */}
                  <motion.div
                    animate={{ opacity: shouldShow ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {modeOption === 'Stopwatch' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                      </svg>
                    )}
                    {modeOption === 'Countdown' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>
                      </svg>
                    )}
                    {modeOption === 'Intervals' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 12h4l3 9 4-18 3 9h4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </motion.div>
                  <motion.span
                    animate={{ opacity: shouldShow ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {modeOption}
                  </motion.span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>

        {/* Timer Mode Content */}
        <div 
          id={`${mode.toLowerCase()}-panel`}
          role="tabpanel"
          aria-labelledby={`${mode.toLowerCase()}-tab`}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        >
          {renderTimer()}
        </div>

        {/* Keyboard Help Modal */}
        <KeyboardHelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          currentMode={mode}
        />
      </div>
    </KeyboardHelpContext.Provider>
  )
}

export const TimerContainer: React.FC = () => {
  return (
    <TimerFocusProvider>
      <TimerContent />
    </TimerFocusProvider>
  )
}