/**
 * SettingsSection Component
 * Reusable card container for settings groups
 */

import React from 'react'
import type { ReactNode } from 'react'

interface SettingsSectionProps {
  icon: string
  title: string
  description?: string
  children: ReactNode
  gradient?: string
  isPremium?: boolean
}

export const SettingsSection: React.FC<SettingsSectionProps> = React.memo(({
  icon,
  title,
  description,
  children,
  gradient = 'from-blue-500/10 via-cyan-500/10 to-teal-500/10',
  isPremium = false
}) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all duration-300 hover:border-white/20">
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Content */}
      <div className="relative p-6">
        {/* Section Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="material-symbols-outlined text-2xl text-white">{icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {isPremium && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold">
                  <span className="text-xs">💎</span>
                  PRO
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* Section Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
})

SettingsSection.displayName = 'SettingsSection'
