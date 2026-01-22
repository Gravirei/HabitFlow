/**
 * KeyboardSettings Component
 * Keyboard shortcuts configuration section
 */

import React from 'react'
import { useTimerSettings } from '../hooks/useTimerSettings'
import { SettingsSection } from './SettingsSection'
import { ToggleSwitch } from './ToggleSwitch'

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
      description: 'Primary timer control'
    },
    {
      key: 'Esc',
      action: 'Stop Timer',
      icon: '⏹️',
      description: 'Stop active timer'
    },
    {
      key: 'K',
      action: 'Kill Timer',
      icon: '🔴',
      description: 'Kill and save to history'
    },
    {
      key: 'L',
      action: 'Add Lap',
      icon: '🏁',
      description: 'Stopwatch mode only'
    },
    {
      key: 'R',
      action: 'Restart',
      icon: '🔄',
      description: 'Quick restart when stopped'
    },
    {
      key: '?',
      action: 'Show Help',
      icon: '❓',
      description: 'Display shortcuts guide'
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
          <div className="p-4 rounded-2xl bg-white/5 space-y-3">
            <label className="text-sm font-semibold text-white">Available Shortcuts</label>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl" role="img" aria-label={shortcut.action}>
                      {shortcut.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{shortcut.action}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{shortcut.description}</p>
                    </div>
                  </div>
                  <kbd className="px-3 py-1.5 bg-gradient-to-br from-white/20 to-white/10 rounded-lg text-xs font-mono font-bold text-white border border-white/30 shadow-sm min-w-[3rem] text-center">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Context Info */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-400 text-xl mt-0.5">info</span>
              <div>
                <p className="text-sm font-semibold text-blue-300">Smart & Context-Aware</p>
                <ul className="text-xs text-blue-400/80 mt-2 space-y-1">
                  <li>• Shortcuts adapt to timer state</li>
                  <li>• Won't trigger while typing in text fields</li>
                  <li>• Space key won't scroll the page</li>
                  <li>• Mode-specific actions (L for Stopwatch only)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">
              💡 <strong className="text-gray-300">Pro Tip:</strong> Use keyboard shortcuts for faster timer control. Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono border border-white/20">Space</kbd> to quickly start/pause, or <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono border border-white/20">L</kbd> to add laps without touching the mouse.
            </p>
          </div>
        </>
      )}
    </SettingsSection>
  )
}
