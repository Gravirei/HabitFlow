/**
 * IntervalPresets Component
 * Modern preset cards with icons for interval timers
 */

import React from 'react'
import { INTERVAL_PRESETS } from '../constants/timer.constants'
import { CustomIntervalPreset } from '../hooks/useCustomIntervalPresets'

interface IntervalPresetsProps {
  presets?: CustomIntervalPreset[]
  onPresetSelect: (work: number, breakTime: number) => void
  onPresetLongPress?: (work: number, breakTime: number) => void
  disabled?: boolean
}

export const IntervalPresets: React.FC<IntervalPresetsProps> = React.memo(({ 
  presets = INTERVAL_PRESETS,
  onPresetSelect,
  onPresetLongPress,
  disabled = false
}) => {
  const [pressTimer, setPressTimer] = React.useState<ReturnType<typeof setTimeout> | null>(null)
  const [isLongPress, setIsLongPress] = React.useState(false)

  const handleMouseDown = (work: number, breakTime: number) => {
    setIsLongPress(false)
    const timer = setTimeout(() => {
      setIsLongPress(true)
      if (onPresetLongPress) {
        onPresetLongPress(work, breakTime)
      }
    }, 500) // 500ms for long press
    setPressTimer(timer)
  }

  const handleMouseUp = (work: number, breakTime: number) => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
    if (!isLongPress) {
      onPresetSelect(work, breakTime)
    }
    setIsLongPress(false)
  }

  const handleMouseLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
    setIsLongPress(false)
  }

  return (
    <div className="w-full max-w-sm px-6 z-10 mt-6 mb-2">
      <div className="grid grid-cols-2 gap-3">
        {presets.map((preset) => {
          const hoverBgColor = preset.color ? `${preset.color}0d` : 'rgba(255,255,255,0.05)'
          
          return (
            <button 
              key={preset.label}
              onMouseDown={() => handleMouseDown(preset.work, preset.break)}
              onMouseUp={() => handleMouseUp(preset.work, preset.break)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => handleMouseDown(preset.work, preset.break)}
              onTouchEnd={() => handleMouseUp(preset.work, preset.break)}
              disabled={disabled}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-all group active:scale-98 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`${preset.label} - ${preset.work}/${preset.break} minutes`}
              title={preset.description}
            >
              {/* Hover overlay with preset color */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: hoverBgColor }}
              />
              
              {/* Icon Badge */}
              <div 
                className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative z-10 flex-shrink-0"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: preset.color || '#13ec5b',
                  boxShadow: `0 0 0 ${preset.color || '#13ec5b'}00`
                }}
              >
                <span 
                  className="material-symbols-outlined text-xl transition-all duration-300 group-hover:drop-shadow-[0_0_15px_currentColor]"
                  style={{ color: preset.color || '#13ec5b' }}
                >
                  {preset.icon || 'timer'}
                </span>
              </div>
              
              {/* Text Content */}
              <div className="flex flex-col items-start relative z-10">
                <span className="text-white/90 text-sm font-bold">
                  {preset.label}
                </span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: preset.color || '#13ec5b' }}
                >
                  {preset.work}m / {preset.break}m · {preset.loopCount}x
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})

IntervalPresets.displayName = 'IntervalPresets'
