/**
 * KeyboardSettings Component
 * Keyboard shortcuts configuration section
 */

import React from 'react'
import { useTimerSettings } from '@/features/timer/hooks/useTimerSettings'
import { SettingsSection } from './SettingsSection'
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch'

export const KeyboardSettings: React.FC = () => {
  const { settings, updateSettings } = useTimerSettings()

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] })
  }

  const shortcuts = [
    {
      key: 'Space',
      action: 'Start / Pause / Continue',
      icon: '▶️',
      description: 'Primary timer control',
    },
    {
      key: 'Esc',
      action: 'Stop Timer',
      icon: '⏹️',
      description: 'Stop active timer',
    },
    {
      key: 'K',
      action: 'Kill Timer',
      icon: '🔴',
      description: 'Kill and save to history',
    },
    {
      key: 'L',
      action: 'Add Lap',
      icon: '🏁',
      description: 'Stopwatch mode only',
    },
    {
      key: 'R',
      action: 'Restart',
      icon: '🔄',
      description: 'Quick restart when stopped',
    },
    {
      key: '?',
      action: 'Show Help',
      icon: '❓',
      description: 'Display shortcuts guide',
    },
  ]

  return (
    <SettingsSection
      icon="keyboard"
      title="Keyboard Shortcuts"
      description="Control timers with keyboard shortcuts"
    >
      {/* Enable toggle */}
      <ToggleSwitch
        enabled={settings.keyboardShortcutsEnabled}
        onChange={() => handleToggle('keyboardShortcutsEnabled')}
        label="Enable Keyboard Shortcuts"
        description="Boost your productivity by keyboard Shortcuts"
      />

      {settings.keyboardShortcutsEnabled && (
        <>
          {/* Shortcuts Reference Table */}
          <div className="space-y-3 rounded-2xl bg-white/5 p-4">
            <label className="text-sm font-semibold text-white">Available Shortcuts</label>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={shortcut.action}>
                      {shortcut.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{shortcut.action}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{shortcut.description}</p>
                    </div>
                  </div>
                  <kbd className="min-w-[3rem] rounded-lg border border-white/30 bg-gradient-to-br from-white/20 to-white/10 px-3 py-1.5 text-center font-mono text-xs font-bold text-white shadow-sm">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Context Info */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-xl text-blue-400">info</span>
              <div>
                <p className="text-sm font-semibold text-blue-300">Smart & Context-Aware</p>
                <ul className="mt-2 space-y-1 text-xs text-blue-400/80">
                  <li>• Shortcuts adapt to timer state</li>
                  <li>• Won't trigger while typing in text fields</li>
                  <li>• Space key won't scroll the page</li>
                  <li>• Mode-specific actions (L for Stopwatch only)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-gray-400">
              💡 <strong className="text-gray-300">Pro Tip:</strong> Use keyboard shortcuts for
              faster timer control. Press{' '}
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                Space
              </kbd>{' '}
              to quickly start/pause, or{' '}
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                L
              </kbd>{' '}
              to add laps without touching the mouse.
            </p>
          </div>
        </>
      )}
    </SettingsSection>
  )
}
