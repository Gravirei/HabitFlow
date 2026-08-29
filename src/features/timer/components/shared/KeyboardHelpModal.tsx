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
  currentMode = 'Stopwatch',
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
      modes: ['Stopwatch', 'Countdown', 'Intervals'],
    },
    {
      keys: ['Esc'],
      action: 'Stop Timer',
      description: 'Stop active timer and save to history',
      icon: '⏹️',
      modes: ['Stopwatch', 'Countdown', 'Intervals'],
    },
    {
      keys: ['K'],
      action: 'Kill Timer',
      description: 'Immediately kill timer and save to history',
      icon: '🔴',
      modes: ['Stopwatch', 'Countdown', 'Intervals'],
    },
    {
      keys: ['L'],
      action: 'Add Lap',
      description: 'Record a lap time (only when running)',
      icon: '🏁',
      modes: ['Stopwatch'],
    },
    {
      keys: ['R'],
      action: 'Restart',
      description: 'Quick restart when timer is stopped',
      icon: '🔄',
      modes: ['Stopwatch', 'Countdown', 'Intervals'],
    },
    {
      keys: ['?'],
      action: 'Show This Help',
      description: 'Display keyboard shortcuts guide',
      icon: '❓',
      modes: ['Stopwatch', 'Countdown', 'Intervals'],
    },
  ]

  const isShortcutAvailable = (shortcut: ShortcutItem) => {
    return !shortcut.modes || shortcut.modes.includes(currentMode)
  }

  const isKeyPressed = (keys: string[]) => {
    return practiceKey && keys.some((key) => key.toLowerCase() === practiceKey.toLowerCase())
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="animate-scale-in relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
        {/* Header - Modern Compact Design */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title & Mode Badge */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <span className="text-xl">⌨️</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold leading-tight text-white">Keyboard Shortcuts</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span className="text-xs font-medium text-gray-400">{currentMode} Mode</span>
                </div>
              </div>
            </div>

            {/* Right: Close Button */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-6">
          {/* Shortcuts List */}
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => {
              const available = isShortcutAvailable(shortcut)
              const pressed = isKeyPressed(shortcut.keys)

              return (
                <div
                  key={index}
                  className={`
                    relative rounded-xl border p-4 transition-all
                    ${
                      pressed
                        ? 'scale-105 border-purple-500/50 bg-gradient-to-r from-purple-500/30 to-pink-500/30 shadow-lg'
                        : available
                          ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          : 'border-white/5 bg-white/[0.02] opacity-50'
                    }
                  `}
                >
                  {pressed && (
                    <div className="absolute -right-2 -top-2">
                      <div className="rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
                        Pressed!
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-3xl">{shortcut.icon}</div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-white">{shortcut.action}</h3>
                          <p className="mt-1 text-sm text-gray-400">{shortcut.description}</p>
                          {!available && (
                            <p className="mt-1 text-xs text-yellow-400">
                              ⚠️ Not available in {currentMode} mode
                            </p>
                          )}
                        </div>

                        {/* Key Badge */}
                        <div className="flex flex-shrink-0 gap-2">
                          {shortcut.keys.map((key, i) => (
                            <kbd
                              key={i}
                              className={`
                                rounded-lg px-3 py-2 font-mono text-sm font-bold shadow-lg
                                ${
                                  pressed
                                    ? 'border-2 border-white/30 bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                    : 'border-2 border-white/30 bg-gradient-to-br from-white/20 to-white/10 text-white'
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
          <div className="mt-6 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <p className="mb-2 text-sm font-semibold text-blue-300">Practice Mode</p>
                <p className="mb-3 text-xs text-blue-400/80">
                  Press any shortcut key to see it highlighted above. Try it now!
                </p>

                {/* Practice Display */}
                <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-blue-500/30 bg-blue-500/5">
                  {practiceKey ? (
                    <div className="animate-bounce-in text-center">
                      <div className="mb-1 text-2xl font-bold text-white">{practiceKey}</div>
                      <div className="text-xs text-blue-400">Key detected!</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Waiting for keypress...</div>
                      <div className="mt-1 text-xs text-gray-600">
                        Press Space, L, R, or any shortcut
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="mb-2 text-sm font-semibold text-white">Pro Tips</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>• Shortcuts won't trigger while typing in text fields</li>
                  <li>• Space key won't scroll the page when timer is active</li>
                  <li>
                    • Press{' '}
                    <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px]">Esc</kbd>{' '}
                    anytime to close this help
                  </li>
                  <li>
                    • Use{' '}
                    <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px]">?</kbd>{' '}
                    to show this help again
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-white/5 p-4">
          <div className="text-xs text-gray-500">
            Press{' '}
            <kbd className="rounded border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px]">
              Esc
            </kbd>{' '}
            to close
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white transition-all hover:from-purple-500 hover:to-pink-500 active:scale-95"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
