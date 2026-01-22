/**
 * SoundSettings Component
 * Sound configuration section with preview functionality
 */

import React from 'react'
import { useTimerSettings, type SoundType } from '../hooks/useTimerSettings'
import { useTimerSound } from '../hooks/useTimerSound'
import { SettingsSection } from './SettingsSection'
import { ToggleSwitch } from './ToggleSwitch'
import { SliderControl } from './SliderControl'

const SOUND_TYPES: { value: SoundType; label: string; preview: string }[] = [
  { value: 'beep', label: 'Classic Beep', preview: '🔔' },
  { value: 'bell', label: 'Bell', preview: '🔔' },
  { value: 'chime', label: 'Chime', preview: '✨' },
  { value: 'digital', label: 'Digital', preview: '📢' },
]

export const SoundSettings: React.FC = () => {
  const { settings, updateSettings } = useTimerSettings()
  const { playPreviewSound } = useTimerSound()

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] })
  }

  const handleSoundTypeChange = (soundType: SoundType) => {
    updateSettings({ soundType })
    // Auto-preview when changing sound type
    playPreviewSound(soundType, settings.soundVolume)
  }

  const handleVolumeChange = (value: number) => {
    updateSettings({ soundVolume: value })
  }

  const handlePreviewClick = () => {
    playPreviewSound()
  }

  return (
    <SettingsSection
      icon="volume_up"
      title="Sound"
      description="Audio feedback when timer completes"
      gradient="from-purple-500/10 via-pink-500/10 to-red-500/10"
    >
      <ToggleSwitch
        enabled={settings.soundEnabled}
        onChange={() => handleToggle('soundEnabled')}
        label="Enable Sound"
        description="Play audio when timer completes"
      />

      <ToggleSwitch
        enabled={settings.showSoundIcon}
        onChange={() => handleToggle('showSoundIcon')}
        label="Show icon in navbar"
        description="Display sound icon in timer navbar"
        disabled={!settings.soundEnabled}
      />

      {settings.soundEnabled && (
        <>
          {/* Sound Type Selection */}
          <div className="p-4 rounded-2xl bg-white/5 space-y-2">
            <label className="text-sm font-semibold text-white">Sound Type</label>
            <div className="grid grid-cols-2 gap-2">
              {SOUND_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSoundTypeChange(type.value)}
                  className={`
                    flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all
                    ${settings.soundType === type.value
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }
                  `}
                >
                  <span className="text-lg">{type.preview}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <SliderControl
            icon="volume_up"
            label="Volume"
            value={settings.soundVolume}
            onChange={handleVolumeChange}
            min={0}
            max={100}
            suffix="%"
          />

          {/* Preview Button */}
          <button
            onClick={handlePreviewClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white font-semibold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">play_circle</span>
            Preview Sound
          </button>

          {/* Info Tip */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">
              💡 <strong className="text-gray-300">Tip:</strong> Click a sound type to hear it instantly. Adjust volume and test again.
            </p>
          </div>
        </>
      )}
    </SettingsSection>
  )
}

SoundSettings.displayName = 'SoundSettings'
