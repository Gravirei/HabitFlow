/**
 * Settings Button Component
 * Button to open settings sidebar with view options
 */

import React from 'react'

interface SettingsButtonProps {
  onOpenSettings: () => void
}

export function SettingsButton({ onOpenSettings }: SettingsButtonProps) {
  return (
    <button 
      onClick={onOpenSettings}
      className="size-12 shrink-0 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark text-slate-700 dark:text-gray-100 border border-transparent dark:border-white/5 shadow-sm active:scale-95 transition-all hover:text-primary"
      aria-label="View settings"
      title="View settings"
    >
      <span className="material-symbols-outlined text-[24px]">settings</span>
    </button>
  )
}
