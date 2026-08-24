/**
 * SliderControl Component
 * Modern animated slider control
 */

import React from 'react'

interface SliderControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  icon?: string
  suffix?: string
}

export const SliderControl: React.FC<SliderControlProps> = React.memo(({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  icon,
  suffix = '%'
}) => {
  // Generate unique ID for accessibility
  const sliderId = React.useId()

  return (
    <div className="p-4 rounded-2xl hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="material-symbols-outlined text-lg text-gray-400">{icon}</span>
          )}
          <label htmlFor={sliderId} className="text-sm font-semibold text-white">
            {label}
          </label>
        </div>
        <span className="text-sm font-bold text-indigo-400" aria-live="polite">
          {value}{suffix}
        </span>
      </div>

      <div className="relative">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          aria-label={`${label}: ${value}${suffix}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value}${suffix}`}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${((value - min) / (max - min)) * 100}%, rgb(55 65 81) ${((value - min) / (max - min)) * 100}%, rgb(55 65 81) 100%)`
          }}
        />

        {/* Slider thumb styles applied via Tailwind */}
      </div>
    </div>
  )
})

SliderControl.displayName = 'SliderControl'
