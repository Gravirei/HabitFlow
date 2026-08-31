/**
 * Premium History Layout Component
 * Main layout wrapper with background effects
 */

import type { ReactNode } from 'react'
import { PremiumHistoryHeader } from './PremiumHistoryHeader'

interface PremiumHistoryLayoutProps {
  children: ReactNode
  title?: string
  onSettingsOpen?: () => void
}

export function PremiumHistoryLayout({
  children,
  title,
  onSettingsOpen,
}: PremiumHistoryLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background-light text-slate-900 dark:bg-background-dark dark:text-white">
      {/* Header */}
      <PremiumHistoryHeader title={title} onSettingsOpen={onSettingsOpen} />

      {/* Main Content */}
      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col pb-28">
        {/* Background Glow Effect */}
        <div className="pointer-events-none fixed left-1/2 top-20 z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        {/* Content */}
        {children}
      </main>
    </div>
  )
}
