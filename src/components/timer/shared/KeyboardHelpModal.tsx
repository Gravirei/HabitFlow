/**
 * KeyboardHelpModal Component
 * Beautiful modal showing all keyboard shortcuts
 * Triggered by pressing ? key
 */

import React, { useState, useEffect } from 'react'

interface KeyboardHelpModalProps {
  isOpen: boolean
  onClose: () => void
  currentMode?: 'Stopwatch' | 'Countdown' | 'Intervals'
}

interface ShortcutItem {
  keys: string[]
  action: string
  description: string
  icon: string
  modes?: string[]
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({
  isOpen,
  onClose,
  currentMode = 'Stopwatch'
}) => {
  const [practiceKey, setPracticeKey] = useState<string | null>(null)

  // Practice mode - detect keypresses
  useEffect(() => {
    if (!isOpen) return

    const handlePracticeKeyPress = (e: KeyboardEvent) => {
      // Don't interfere with Escape to close modal
      if (e.key === 'Escape') return
      
      setPracticeKey(e.key === ' ' ? 'Space' : e.key)
      setTimeout(() => setPracticeKey(null), 2000)
    }

    window.addEventListener('keydown', handlePracticeKeyPress)
    return () => window.removeEventListener('keydown', handlePracticeKeyPress)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts: ShortcutItem[] = [
    {
      keys: ['Space'],
      action: 'Start / Pause / Continue',
      description: 'Primary timer control - cycles through states',
      icon: '▶️',
      modes: ['Stopwatch', 'Countdown', 'Intervals']
    },
    {
      keys: ['Esc'],
      action: 'Stop Timer',
      description: 'Stop active timer and save to history',
      icon: '⏹️',
      modes: ['Stopwatch', 'Countdown', 'Intervals']
    },
    {
      keys: ['K'],
      action: 'Kill Timer',
      description: 'Immediately kill timer and save to history',
      icon: '🔴',
      modes: ['Stopwatch', 'Countdown', 'Intervals']
    },
    {
      keys: ['L'],
      action: 'Add Lap',
      description: 'Record a lap time (only when running)',
      icon: '🏁',
      modes: ['Stopwatch']
    },
    {
      keys: ['R'],
      action: 'Restart',
      description: 'Quick restart when timer is stopped',
      icon: '🔄',
      modes: ['Stopwatch', 'Countdown', 'Intervals']
    },
    {
      keys: ['?'],
      action: 'Show This Help',
      description: 'Display keyboard shortcuts guide',
      icon: '❓',
      modes: ['Stopwatch', 'Countdown', 'Intervals']
    }
  ]

  const isShortcutAvailable = (shortcut: ShortcutItem) => {
    return !shortcut.modes || shortcut.modes.includes(currentMode)
  }

  const isKeyPressed = (keys: string[]) => {
    return practiceKey && keys.some(key => 
      key.toLowerCase() === practiceKey.toLowerCase()
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-scale-in">
        
        {/* Header - Modern Compact Design */}
        <div className="relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title & Mode Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <span className="text-xl">⌨️</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white leading-tight">
                  Keyboard Shortcuts
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs font-medium text-gray-400">
                    {currentMode} Mode
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Close Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white active:scale-95"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Shortcuts List */}
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => {
              const available = isShortcutAvailable(shortcut)
              const pressed = isKeyPressed(shortcut.keys)
              
              return (
                <div
                  key={index}
                  className={`
                    relative p-4 rounded-xl border transition-all
                    ${pressed 
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-500/50 scale-105 shadow-lg' 
                      : available
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }
                  `}
                >
                  {pressed && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        Pressed!
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl flex-shrink-0">
                      {shortcut.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {shortcut.action}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {shortcut.description}
                          </p>
                          {!available && (
                            <p className="text-xs text-yellow-400 mt-1">
                              ⚠️ Not available in {currentMode} mode
                            </p>
                          )}
                        </div>

                        {/* Key Badge */}
                        <div className="flex gap-2 flex-shrink-0">
                          {shortcut.keys.map((key, i) => (
                            <kbd
                              key={i}
                              className={`
                                px-3 py-2 rounded-lg text-sm font-mono font-bold shadow-lg
                                ${pressed
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-2 border-white/30'
                                  : 'bg-gradient-to-br from-white/20 to-white/10 text-white border-2 border-white/30'
                                }
                              `}
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Practice Mode Section */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-300 mb-2">
                  Practice Mode
                </p>
                <p className="text-xs text-blue-400/80 mb-3">
                  Press any shortcut key to see it highlighted above. Try it now!
                </p>
                
                {/* Practice Display */}
                <div className="h-16 rounded-lg border-2 border-dashed border-blue-500/30 bg-blue-500/5 flex items-center justify-center">
                  {practiceKey ? (
                    <div className="text-center animate-bounce-in">
                      <div className="text-2xl font-bold text-white mb-1">
                        {practiceKey}
                      </div>
                      <div className="text-xs text-blue-400">
                        Key detected!
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">
                        Waiting for keypress...
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Press Space, L, R, or any shortcut
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-white mb-2">
                  Pro Tips
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Shortcuts won't trigger while typing in text fields</li>
                  <li>• Space key won't scroll the page when timer is active</li>
                  <li>• Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-mono">Esc</kbd> anytime to close this help</li>
                  <li>• Use <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-mono">?</kbd> to show this help again</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Press <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono border border-white/20">Esc</kbd> to close
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all active:scale-95"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
