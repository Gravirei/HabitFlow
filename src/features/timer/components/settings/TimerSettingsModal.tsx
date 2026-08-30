/**
 * TimerSettingsModal Component
 * Modern, sleek settings modal with card-based design
 */

import React from 'react'
import { useIsMobile } from '@/hooks/useDeviceType'
import { SettingsHeader } from './SettingsHeader'
import { SoundSettings } from './SoundSettings'
import { VibrationSettings } from './VibrationSettings'
import { NotificationSettings } from './NotificationSettings'
import { AutoStartSettings } from './AutoStartSettings'
import { KeyboardSettings } from './KeyboardSettings'
import { HistorySettings } from './HistorySettings'
import { ResetSection } from './ResetSection'

interface TimerSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TimerSettingsModal: React.FC<TimerSettingsModalProps> = React.memo(
  ({ isOpen, onClose }) => {
    const isMobile = useIsMobile()

    if (!isOpen) return null

    return (
      <>
        {/* Backdrop with enhanced blur and animation */}
        <div
          className="animate-in fade-in fixed inset-0 z-50 bg-black/80 backdrop-blur-xl duration-300"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div
            className="animate-in zoom-in-95 fade-in pointer-events-auto relative max-h-[90vh] w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient orbs */}
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />

            {/* Header */}
            <SettingsHeader onClose={onClose} />

            {/* Content - Scrollable */}
            <div className="custom-scrollbar relative max-h-[calc(90vh-120px)] flex-1 space-y-5 overflow-y-auto px-6 py-6">
              {/* Settings Sections */}
              <SoundSettings />
              <VibrationSettings />
              <NotificationSettings />
              <AutoStartSettings />

              {/* Keyboard shortcuts - Only show on non-mobile devices */}
              {!isMobile && <KeyboardSettings />}

              {/* History Settings - Premium Feature */}
              <HistorySettings />

              {/* Reset Section */}
              <ResetSection />

              {/* Footer */}
              <div className="pt-4 text-center">
                <p className="text-xs text-gray-500">HabitFlow Timer Settings • Version 1.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom scrollbar styles applied via Tailwind */}
      </>
    )
  }
)

TimerSettingsModal.displayName = 'TimerSettingsModal'
