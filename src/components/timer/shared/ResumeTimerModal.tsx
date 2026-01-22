/**
 * ResumeTimerModal Component
 * 
 * Modal that prompts user to resume a saved timer state.
 * Shows timer details and allows user to resume or discard.
 */

import React from 'react'
import { timerPersistence, type SavedTimerState } from '../utils/timerPersistence'

interface ResumeTimerModalProps {
  isOpen: boolean
  savedState: SavedTimerState | null
  onResume: () => void
  onDiscard: () => void
  onClose: () => void
}

export const ResumeTimerModal: React.FC<ResumeTimerModalProps> = ({
  isOpen,
  savedState,
  onResume,
  onDiscard,
  onClose
}) => {
  if (!isOpen || !savedState) return null

  // Get timer details
  const validation = timerPersistence.validateResume(savedState)
  const description = timerPersistence.getTimerDescription(savedState)
  const timeSinceSave = timerPersistence.getTimeSinceSave(savedState)

  // Mode-specific icons
  const modeIcons = {
    Stopwatch: '⏱️',
    Countdown: '⏲️',
    Intervals: '🔄'
  }

  // Mode-specific colors
  const modeColors = {
    Stopwatch: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    Countdown: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    Intervals: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{modeIcons[savedState.mode]}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Resume Timer?</h2>
              <p className="text-sm text-gray-400 mt-1">
                You had a timer running
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Timer Info Card */}
          <div
            className={`p-4 rounded-2xl bg-gradient-to-br ${modeColors[savedState.mode]} border`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-white">
                {savedState.mode} Timer
              </span>
              {savedState.isPaused && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                  Paused
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Status:</span>
                <span className="text-sm font-semibold text-white">
                  {description}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Last active:</span>
                <span className="text-sm font-semibold text-white">
                  {timeSinceSave}
                </span>
              </div>

              {/* Remaining time for Countdown/Intervals */}
              {validation.remainingTime !== undefined && validation.remainingTime > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-sm text-gray-300">Remaining:</span>
                  <span className="text-xl font-bold text-white">
                    {timerPersistence.formatRemainingTime(validation.remainingTime)}
                  </span>
                </div>
              )}

              {/* Intervals-specific info */}
              {savedState.mode === 'Intervals' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Progress:</span>
                  <span className="text-sm font-semibold text-white">
                    Loop {savedState.currentLoop}/{savedState.targetLoops} •{' '}
                    {savedState.currentInterval === 'work' ? 'Work' : 'Break'}
                  </span>
                </div>
              )}

              {/* Stopwatch laps */}
              {savedState.mode === 'Stopwatch' && savedState.laps.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Laps recorded:</span>
                  <span className="text-sm font-semibold text-white">
                    {savedState.laps.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning for old timers */}
          {validation.canResume && savedState.savedAt < Date.now() - 60 * 60 * 1000 && (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-yellow-300">
                ⚠️ This timer has been inactive for over an hour. Time calculations may not be accurate.
              </p>
            </div>
          )}

          {/* Info text */}
          <p className="text-xs text-gray-400 text-center">
            Resuming will restore your timer from where it left off
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Discard
          </button>
          <button
            onClick={onResume}
            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Resume Timer
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
