/**
 * VibrationSettings Component
 * Vibration configuration section with preview functionality
 */

import React from 'react'
import { useTimerSettings, type VibrationPattern } from '@/features/timer/hooks/useTimerSettings'
import { useTimerSound } from '@/features/timer/hooks/useTimerSound'
import { SettingsSection } from './SettingsSection'
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch'

const VIBRATION_PATTERNS: { value: VibrationPattern; label: string; description: string }[] = [
  { value: 'short', label: 'Short', description: 'Single short vibration' },
  { value: 'long', label: 'Long', description: 'Single long vibration' },
  { value: 'pulse', label: 'Pulse', description: 'Rhythmic pulse vibration' },
]

export const VibrationSettings: React.FC = () => {
  const { settings, updateSettings } = useTimerSettings()
  const { playPreviewVibration, isVibrationSupported } = useTimerSound()

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] })
  }

  const handlePatternChange = (vibrationPattern: VibrationPattern) => {
    updateSettings({ vibrationPattern })
    // Auto-preview when changing pattern (if supported)
    if (isVibrationSupported) {
      playPreviewVibration(vibrationPattern)
    }
  }

  const handlePreviewClick = () => {
    playPreviewVibration()
  }

  return (
    <SettingsSection
      icon="vibration"
      title="Vibration"
      description="Haptic feedback for timer completion"
      gradient="from-blue-500/10 via-cyan-500/10 to-teal-500/10"
    >
      <ToggleSwitch
        enabled={settings.vibrationEnabled}
        onChange={() => handleToggle('vibrationEnabled')}
        label="Enable Vibration"
        description="Vibrate when timer completes (mobile only)"
      />

      <ToggleSwitch
        enabled={settings.showVibrationIcon}
        onChange={() => handleToggle('showVibrationIcon')}
        label="Show icon in navbar"
        description="Display vibration icon in timer navbar"
        disabled={!settings.vibrationEnabled}
      />

      {settings.vibrationEnabled && (
        <>
          {/* Vibration Not Supported Warning */}
          {!isVibrationSupported && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-xl text-yellow-400">warning</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-300">Vibration Not Supported</p>
                  <p className="mt-1 text-xs text-yellow-400/80">
                    Your device or browser doesn't support the Vibration API. This is normal for
                    desktop computers and iOS devices.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vibration Pattern Selection */}
          <div className="space-y-3 rounded-2xl bg-white/5 p-4">
            <label className="text-sm font-semibold text-white">Vibration Pattern</label>
            <div className="space-y-2">
              {VIBRATION_PATTERNS.map((pattern) => (
                <button
                  key={pattern.value}
                  onClick={() => handlePatternChange(pattern.value)}
                  disabled={!isVibrationSupported}
                  className={`
                    flex w-full items-center justify-between rounded-xl p-4 text-left transition-all
                    ${
                      settings.vibrationPattern === pattern.value
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }
                    ${!isVibrationSupported ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <div>
                    <p className="text-sm font-semibold">{pattern.label}</p>
                    <p
                      className={`mt-1 text-xs ${settings.vibrationPattern === pattern.value ? 'text-blue-100' : 'text-gray-400'}`}
                    >
                      {pattern.description}
                    </p>
                  </div>
                  {settings.vibrationPattern === pattern.value && (
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Button */}
          <button
            onClick={handlePreviewClick}
            disabled={!isVibrationSupported}
            className={`
              flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all
              ${
                isVibrationSupported
                  ? 'border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white hover:from-blue-500/30 hover:to-cyan-500/30 active:scale-95'
                  : 'cursor-not-allowed border border-white/10 bg-white/5 text-gray-500 opacity-50'
              }
            `}
          >
            <span className="material-symbols-outlined text-xl">vibration</span>
            {isVibrationSupported ? 'Test Vibration' : 'Vibration Not Available'}
          </button>

          {/* Info Tip */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-gray-400">
              💡 <strong className="text-gray-300">Tip:</strong>{' '}
              {isVibrationSupported
                ? 'Click a pattern to feel it instantly. Works best on Android devices.'
                : 'Vibration works on Android devices. Not supported on desktop or iOS.'}
            </p>
          </div>
        </>
      )}
    </SettingsSection>
  )
}

VibrationSettings.displayName = 'VibrationSettings'
