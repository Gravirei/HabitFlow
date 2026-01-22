/**
 * AutoStartSettings Component
 * Auto-start intervals configuration
 */

import React from 'react'
import { useTimerSettings } from '../hooks/useTimerSettings'
import { SettingsSection } from './SettingsSection'
import { ToggleSwitch } from './ToggleSwitch'

export const AutoStartSettings: React.FC = () => {
  const { settings, updateSettings } = useTimerSettings()

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] })
  }

  return (
    <SettingsSection
      icon="autorenew"
      title="Auto-Start"
      description="Automatically start next interval"
      gradient="from-green-500/10 via-emerald-500/10 to-teal-500/10"
    >
      <ToggleSwitch
        enabled={settings.autoStartBreak}
        onChange={() => handleToggle('autoStartBreak')}
        label="Auto-Start Break"
        description="Automatically start break after work interval"
      />

      <ToggleSwitch
        enabled={settings.autoStartWork}
        onChange={() => handleToggle('autoStartWork')}
        label="Auto-Start Work"
        description="Automatically start work after break interval"
      />

      <div className="p-4 rounded-2xl bg-white/5">
        <p className="text-xs text-gray-400">
          💡 <strong className="text-gray-300">Tip:</strong> Enable both for a seamless Pomodoro experience without manual intervention
        </p>
      </div>
    </SettingsSection>
  )
}

AutoStartSettings.displayName = 'AutoStartSettings'
