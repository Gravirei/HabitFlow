/**
 * SettingsHeader Component
 * Modern modal header with close button
 */

import React from 'react'

interface SettingsHeaderProps {
  onClose: () => void
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = React.memo(({ onClose }) => {
  return (
    <div className="relative flex items-center justify-between rounded-t-3xl border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-8 py-6 backdrop-blur-xl">
      <div>
        <h2 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-2xl font-bold text-transparent">
          Timer Settings
        </h2>
        <p className="mt-1 text-sm text-gray-400">Customize your perfect timer experience</p>
      </div>
      <button
        onClick={onClose}
        className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 transition-all duration-200 hover:rotate-90 hover:bg-white/15 active:scale-95"
        aria-label="Close settings"
      >
        <span className="material-symbols-outlined text-xl text-gray-400 transition-colors group-hover:text-white">
          close
        </span>
      </button>
    </div>
  )
})

SettingsHeader.displayName = 'SettingsHeader'
