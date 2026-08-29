// @ts-nocheck
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
      className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-transparent bg-white text-slate-700 shadow-sm transition-all hover:text-primary active:scale-95 dark:border-white/5 dark:bg-surface-dark dark:text-gray-100"
      aria-label="View settings"
      title="View settings"
    >
      <span className="material-symbols-outlined text-[24px]">settings</span>
    </button>
  )
}
