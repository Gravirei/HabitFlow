/**
 * SessionSetupModal Component
 * Modal for setting up session name and loop count before starting intervals
 */

import React, { useState, useEffect } from 'react'
import type { SessionSetupModalProps } from '../types/timer.types'

export const SessionSetupModal: React.FC<SessionSetupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSessionName = '',
  initialLoopCount = 4
}) => {
  const [sessionName, setSessionName] = useState(initialSessionName)
  const [loopCount, setLoopCount] = useState(initialLoopCount)

  // Reset values when modal opens
  useEffect(() => {
    if (isOpen) {
      setSessionName(initialSessionName)
      setLoopCount(initialLoopCount)
    }
  }, [isOpen, initialSessionName, initialLoopCount])

  const handleConfirm = () => {
    const trimmedName = sessionName.trim() || 'Untitled Session'
    onConfirm(trimmedName, loopCount)
  }

  const handleIncrement = () => {
    if (loopCount < 50) {
      setLoopCount(loopCount + 1)
    }
  }

  const handleDecrement = () => {
    if (loopCount > 1) {
      setLoopCount(loopCount - 1)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Limit to 50 characters
    if (value.length <= 50) {
      setSessionName(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12h4l3 9 4-18 3 9h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Start Session</h2>
              <p className="text-sm text-white/50">
                Configure your interval session
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4">
          {/* Session Name Input */}
          <div className="mb-6">
            <label className="block text-white/70 text-xs font-medium mb-2 uppercase tracking-wider">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Morning Focus, Workout"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
              maxLength={50}
              autoFocus
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-white/40">Name your session</span>
              <span className="text-xs text-white/40">{sessionName.length}/50</span>
            </div>
          </div>

          {/* Loop Count Input */}
          <div className="mb-4">
            <label className="block text-white/70 text-xs font-medium mb-3 uppercase tracking-wider">
              Loop Count
            </label>

            <div className="flex items-center justify-center gap-4">
              {/* Decrement Button */}
              <button
                onClick={handleDecrement}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all"
                style={{ color: '#13ec5b' }}
                disabled={loopCount <= 1}
              >
                <span className="material-symbols-outlined text-3xl">
                  remove
                </span>
              </button>

              {/* Loop Count Display */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-32 h-24 rounded-2xl border-2 flex items-center justify-center text-5xl font-bold text-white bg-transparent">
                  {loopCount.toString().padStart(2, '0')}
                </div>
                <span className="text-xs text-white/50 uppercase tracking-wider">Sets</span>
              </div>

              {/* Increment Button */}
              <button
                onClick={handleIncrement}
                className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all"
                style={{ color: '#13ec5b' }}
                disabled={loopCount >= 50}
              >
                <span className="material-symbols-outlined text-3xl">
                  add
                </span>
              </button>
            </div>

            <div className="text-center mt-3">
              <span className="text-xs text-white/40">
                Each set = Work + Break cycle
              </span>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-5 py-3 rounded-xl font-bold active:scale-95 transition-all text-black"
            style={{
              background: 'linear-gradient(135deg, #13ec5b, #10d94f)',
              boxShadow: '0 4px 20px #13ec5b40'
            }}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  )
}
