/**
 * ToggleSwitch Component
 * Modern animated toggle switch
 */

import React from 'react'

interface ToggleSwitchProps {
  enabled: boolean
  onChange: () => void
  label: string
  description?: string
  disabled?: boolean
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = React.memo(
  ({ enabled, onChange, label, description, disabled = false }) => {
    return (
      <div className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-200 hover:bg-white/5">
        <div className="flex-1">
          <label
            className={`text-sm font-semibold ${disabled ? 'text-gray-500' : 'text-white'} cursor-pointer`}
          >
            {label}
          </label>
          {description && (
            <p className={`mt-1 text-xs ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
              {description}
            </p>
          )}
        </div>

        <button
          onClick={onChange}
          disabled={disabled}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${enabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-600'} ${!disabled && 'hover:scale-105'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
          role="switch"
          aria-checked={enabled}
          aria-label={label}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'} ${enabled ? 'shadow-green-400/50' : 'shadow-gray-700'} `}
          />
        </button>
      </div>
    )
  }
)

ToggleSwitch.displayName = 'ToggleSwitch'
