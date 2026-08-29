/**
 * SessionSetupModal Component
 * Modal for setting up session name and loop count before starting intervals
 */

import React, { useState, useEffect } from 'react'
import type { SessionSetupModalProps } from '@/features/timer/types/timer.types'

export const SessionSetupModal: React.FC<SessionSetupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSessionName = '',
  initialLoopCount = 4,
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
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900 to-black shadow-2xl">
        {/* Header */}
        <div className="relative px-6 pb-4 pt-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white/70"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 12h4l3 9 4-18 3 9h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Start Session</h2>
              <p className="text-sm text-white/50">Configure your interval session</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4">
          {/* Session Name Input */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/70">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Morning Focus, Workout"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-all focus:border-primary/50 focus:bg-white/10 focus:outline-none"
              maxLength={50}
              autoFocus
            />
            <div className="mt-1 flex justify-between">
              <span className="text-xs text-white/40">Name your session</span>
              <span className="text-xs text-white/40">{sessionName.length}/50</span>
            </div>
          </div>

          {/* Loop Count Input */}
          <div className="mb-4">
            <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-white/70">
              Loop Count
            </label>

            <div className="flex items-center justify-center gap-4">
              {/* Decrement Button */}
              <button
                onClick={handleDecrement}
                className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                style={{ color: '#13ec5b' }}
                disabled={loopCount <= 1}
              >
                <span className="material-symbols-outlined text-3xl">remove</span>
              </button>

              {/* Loop Count Display */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-24 w-32 items-center justify-center rounded-2xl border-2 bg-transparent text-5xl font-bold text-white">
                  {loopCount.toString().padStart(2, '0')}
                </div>
                <span className="text-xs uppercase tracking-wider text-white/50">Sets</span>
              </div>

              {/* Increment Button */}
              <button
                onClick={handleIncrement}
                className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                style={{ color: '#13ec5b' }}
                disabled={loopCount >= 50}
              >
                <span className="material-symbols-outlined text-3xl">add</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs text-white/40">Each set = Work + Break cycle</span>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/5 px-5 py-3 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl px-5 py-3 font-bold text-black transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #13ec5b, #10d94f)',
              boxShadow: '0 4px 20px #13ec5b40',
            }}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  )
}
