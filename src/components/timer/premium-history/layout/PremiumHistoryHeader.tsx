/**
 * Premium History Header Component
 * Sticky header with back button and title
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

interface PremiumHistoryHeaderProps {
  title?: string
  onSettingsOpen?: () => void
}

export function PremiumHistoryHeader({ title = 'Timer History', onSettingsOpen }: PremiumHistoryHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
      <div className="flex items-center px-4 py-3 justify-between h-16">
        <button 
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {title}
        </h2>
        {onSettingsOpen && (
          <button 
            onClick={onSettingsOpen}
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-95"
            aria-label="View settings"
            title="View settings"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">settings</span>
          </button>
        )}
      </div>
    </header>
  )
}
