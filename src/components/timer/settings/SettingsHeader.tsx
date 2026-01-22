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
    <div className="relative flex items-center justify-between px-8 py-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-white/10 rounded-t-3xl">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Timer Settings
        </h2>
        <p className="text-sm text-gray-400 mt-1">Customize your perfect timer experience</p>
      </div>
      <button
        onClick={onClose}
        className="group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 transition-all duration-200 hover:rotate-90"
        aria-label="Close settings"
      >
        <span className="material-symbols-outlined text-xl text-gray-400 group-hover:text-white transition-colors">
          close
        </span>
      </button>
    </div>
  )
})

SettingsHeader.displayName = 'SettingsHeader'
