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
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
        <p className="text-white/50 text-sm text-center py-8">
          Desktop sidebar coming soon
        </p>
      </div>
    </aside>
  )
}
