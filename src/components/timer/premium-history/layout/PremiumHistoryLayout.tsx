/**
 * Premium History Layout Component
 * Main layout wrapper with background effects
 */

import React, { ReactNode } from 'react'
import { PremiumHistoryHeader } from './PremiumHistoryHeader'

interface PremiumHistoryLayoutProps {
  children: ReactNode
  title?: string
  onSettingsOpen?: () => void
}

export function PremiumHistoryLayout({ children, title, onSettingsOpen }: PremiumHistoryLayoutProps) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <PremiumHistoryHeader title={title} onSettingsOpen={onSettingsOpen} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-28 w-full max-w-md mx-auto relative">
        {/* Background Glow Effect */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Content */}
        {children}
      </main>
    </div>
  )
}
