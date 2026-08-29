// @ts-nocheck
/**
 * Premium History Sidebar Component
 * Desktop sidebar navigation (future feature)
 * Currently not used in mobile-first design
 */

import React from 'react'

interface PremiumHistorySidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function PremiumHistorySidebar({ activeTab, onTabChange }: PremiumHistorySidebarProps) {
  // Placeholder for future desktop sidebar with navigation tabs
  // Will include: Dashboard, Analytics, Insights, Export, etc.

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <p className="py-8 text-center text-sm text-white/50">Desktop sidebar coming soon</p>
      </div>
    </aside>
  )
}
